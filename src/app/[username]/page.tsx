// src/app/[username]/page.tsx

import { PrismaClient } from "@prisma/client";
import { trackProfileView } from "@/actions/trackView";
import DirectLinkInterstitial from "@/components/DirectLinkInterstitial";
import FollowButton from "@/components/FollowButton";
import HamsaHand from "@/components/HamsaHand";
import SalonFooter from "@/components/SalonFooter"; // [NEW] 追加
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkIsFollowing } from "@/actions/followActions";
import Link from "next/link";
import { getTheme } from "@/lib/themeConfig";

const prisma = new PrismaClient();

interface UserProfilePageProps {
  params: {
    username: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const { username } = params;
  const session = await getServerSession(authOptions);

  // ユーザー情報取得（サロン情報に location, mapUrl, websiteUrl, logoUrl, primaryColor を追加で取得）
  const user = await prisma.user.findUnique({
    where: { username: decodeURIComponent(username) },
    include: {
        favorites: {
            include: { selectedUser: true },
            orderBy: { slotIndex: 'asc' }
        },
        salon: {
            include: { theme: true }
        }
    }
  });

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">ユーザーが見つかりません</div>;
  }
  
  // ダイレクトリンク処理
  const fromInterstitial = searchParams.from === 'interstitial';
  if (user.directLinkEnabled && user.directLinkUrl && !fromInterstitial) {
    return <DirectLinkInterstitial redirectUrl={user.directLinkUrl} profileUrl={`/${user.username}`} />;
  }

  // 閲覧記録
  await trackProfileView(user.id);

  // 本人確認 & フォロー状態
  const isOwner = session?.user?.id === user.id;
  const isFollowing = session?.user?.id && !isOwner ? await checkIsFollowing(user.id) : false;

  // テーマ決定ロジック
  const queryTheme = typeof searchParams.theme === 'string' ? searchParams.theme : null;
  const themeId = queryTheme || "default"; 
  const theme = getTheme(themeId);

  // 五大元素スロットの整形
  const slots = Array(5).fill(null);
  user.favorites.forEach(fav => {
      if (fav.slotIndex >= 0 && fav.slotIndex < 5) {
          slots[fav.slotIndex] = fav.selectedUser;
      }
  });

  return (
    <div className={`min-h-screen flex flex-col items-center py-10 px-4 transition-colors duration-500 ${theme.bgClass} ${theme.textClass} ${theme.fontClass}`}>
      
      {/* ヘッダー情報 */}
      <div className="text-center z-10 mb-6">
        <div className="relative inline-block">
            {user.image ? (
                <img src={user.image} alt={user.name || ''} className="w-24 h-24 rounded-full object-cover border-4 shadow-xl" style={{ borderColor: theme.accentColor }} />
            ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-xl bg-gray-200 text-gray-400" style={{ borderColor: theme.accentColor }}>No Img</div>
            )}
             {/* サロンバッジはFooterに移動するため削除、または小さく残す */}
        </div>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">{user.name}</h1>
        <p className="opacity-70 text-sm">{user.title}</p>
        
        {/* アクションボタン */}
        <div className="mt-4 flex gap-2 justify-center">
            {!isOwner && session?.user?.id && (
                <FollowButton targetUserId={user.id} isFollowingInitial={isFollowing} />
            )}
            
             {/* デモ用テーマ切り替えボタン (オーナーのみ表示) */}
             {isOwner && (
                 <div className="flex gap-1">
                     <Link href={`/${username}?theme=default`} className="px-2 py-1 text-[10px] bg-white border rounded text-black">Default</Link>
                     <Link href={`/${username}?theme=cyber`} className="px-2 py-1 text-[10px] bg-black text-green-400 border border-green-500 rounded">Cyber</Link>
                     <Link href={`/${username}?theme=zen`} className="px-2 py-1 text-[10px] bg-[#F5F5F0] border border-stone-400 rounded text-stone-800">Zen</Link>
                 </div>
             )}
        </div>
      </div>

      {/* --- メインコンテンツ: Digital Hamsa --- */}
      <div className="w-full max-w-md z-10">
          <HamsaHand slots={slots} themeId={theme.id} />
      </div>

      {/* 自己紹介など */}
      <div className="mt-8 max-w-sm text-center z-10 opacity-80 text-sm leading-relaxed whitespace-pre-wrap">
          {user.bio}
      </div>

      {/* フッターリンク */}
      <div className="mt-10 flex gap-6 text-2xl z-10 opacity-60">
        {user.website && <a href={user.website} target="_blank" className="hover:opacity-100 transition-opacity">🌐</a>}
        {user.twitter && <a href={user.twitter} target="_blank" className="hover:opacity-100 transition-opacity">🐦</a>}
        {user.instagram && <a href={user.instagram} target="_blank" className="hover:opacity-100 transition-opacity">📸</a>}
      </div>

      {/* [NEW] 店舗情報Footer */}
      {user.salon && (
        <SalonFooter salon={user.salon} />
      )}

      <div className="mt-8 text-[10px] opacity-40">
          POWERED BY PONNU
      </div>

    </div>
  );
}