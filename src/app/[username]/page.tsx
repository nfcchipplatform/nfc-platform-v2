// src/app/[username]/page.tsx

import { PrismaClient } from "@prisma/client";
import { trackProfileView } from "@/actions/trackView";
import DirectLinkInterstitial from "@/components/DirectLinkInterstitial";
import FollowButton from "@/components/FollowButton";
import InteractiveHand from "@/components/InteractiveHand";
import SalonFooter from "@/components/SalonFooter";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkIsFollowing } from "@/actions/followActions";
import Link from "next/link";
import { getTheme } from "@/lib/themeConfig";
import { Suspense } from "react";

const prisma = new PrismaClient();

// キャッシュ設定: 60秒間キャッシュ
export const revalidate = 60;

interface UserProfilePageProps {
  params: {
    username: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) {
  const { username } = params;
  const session = await getServerSession(authOptions);

  // ユーザー情報取得（必要なカラムのみselectで最適化）
  const user = await prisma.user.findUnique({
    where: { username: decodeURIComponent(username) },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
      title: true,
      bio: true,
      website: true,
      twitter: true,
      instagram: true,
      directLinkEnabled: true,
      directLinkUrl: true,
      favorites: {
        select: {
          slotIndex: true,
          selectedUser: {
            select: {
              id: true,
              username: true,
              name: true,
              image: true,
              title: true,
            }
          }
        },
        orderBy: { slotIndex: 'asc' }
      },
      salon: {
        select: {
          id: true,
          name: true,
          logoUrl: true,
          primaryColor: true,
          accentColor: true,
          theme: {
            select: {
              id: true,
              name: true,
            }
          }
        }
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

  // 本人確認
  const isOwner = session?.user?.id === user.id;
  
  // 閲覧記録を完全非同期化（fire-and-forget）- レスポンスをブロックしない
  trackProfileView(user.id).catch(err => {
    console.error("Failed to track view:", err);
  });
  
  // フォロー状態チェックのみawait（必要最小限）
  const isFollowing = session?.user?.id && !isOwner 
    ? await checkIsFollowing(user.id) 
    : false;

  // --- テーマ決定ロジック (常にデフォルトを使用) ---
  const themeId = "default";
  const theme = getTheme(themeId);

  // 五大元素スロットの整形
  const slots = Array(5).fill(null);
  user.favorites.forEach(fav => {
      if (fav.slotIndex >= 0 && fav.slotIndex < 5) {
          slots[fav.slotIndex] = fav.selectedUser;
      }
  });

  return (
    <div className={`min-h-screen flex flex-col items-center py-0 px-0 transition-colors duration-500 ${theme.bgClass} ${theme.textClass} ${theme.fontClass}`}>
      
      {/* --- メインコンテンツ: Interactive Hand (Suspenseでストリーミング) --- */}
      <Suspense fallback={
        <div className="w-full max-w-[450px] mx-auto aspect-[3/4] relative">
          <div className="absolute inset-0 bg-gray-100 animate-pulse" />
        </div>
      }>
        <div className="w-full z-10">
          <InteractiveHand slots={slots} />
        </div>
      </Suspense>

      {/* 名前以降のコンテンツは左右余白を持たせるための div で囲う */}
      <div className="w-full px-4 flex flex-col items-center">
        <div className="text-center z-10 mt-4">
          <h1 className="text-2xl font-bold tracking-tight">{user.name}</h1>
          <p className="opacity-70 text-sm mt-1">{user.title}</p>
          
          {/* アクションボタン */}
          <div className="mt-4 flex gap-2 justify-center">
              {!isOwner && session?.user?.id && (
                  <FollowButton targetUserId={user.id} isFollowingInitial={isFollowing} />
              )}
          </div>
        </div>

        {/* 自己紹介 */}
        <div className="mt-8 max-w-sm text-center z-10 opacity-80 text-sm leading-relaxed whitespace-pre-wrap">
            {user.bio}
        </div>

        {/* フッターリンク */}
        <div className="mt-10 flex gap-6 text-sm z-10 opacity-60">
          {user.website && (
            <a href={user.website} target="_blank" className="hover:opacity-100 transition-opacity">
              Website
            </a>
          )}
          {user.twitter && (
            <a href={user.twitter} target="_blank" className="hover:opacity-100 transition-opacity">
              Twitter
            </a>
          )}
          {user.instagram && (
            <a href={user.instagram} target="_blank" className="hover:opacity-100 transition-opacity">
              Instagram
            </a>
          )}
        </div>

        {/* 店舗情報Footer */}
        {user.salon && (
          <SalonFooter salon={user.salon as any} />
        )}

        <Link
          href="https://app.ponnu.net/"
          className="mt-8 mb-10 text-[10px] opacity-40 hover:opacity-80 transition-opacity"
        >
          POWERED BY PONNU
        </Link>
      </div>
    </div>
  );
}