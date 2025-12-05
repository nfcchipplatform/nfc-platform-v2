// src/app/[username]/page.tsx

import { PrismaClient } from "@prisma/client";
import { trackProfileView } from "@/actions/trackView";
import VCardButton from "@/components/VCardButton";
import DirectLinkInterstitial from "@/components/DirectLinkInterstitial";
import FollowButton from "@/components/FollowButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkIsFollowing } from "@/actions/followActions";

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

  const user = await prisma.user.findUnique({
    where: {
      username: decodeURIComponent(username),
    },
  });

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold">ユーザーが見つかりません</h1>
      </div>
    );
  }
  
  // ダイレクトリンクのロジック
  const fromInterstitial = searchParams.from === 'interstitial';
  if (user.directLinkEnabled && user.directLinkUrl && !fromInterstitial) {
    return (
      <DirectLinkInterstitial 
        redirectUrl={user.directLinkUrl}
        profileUrl={`/${user.username}`}
      />
    );
  }

  // 閲覧記録
  await trackProfileView(user.id);

  // 閲覧者が本人かどうか
  const isOwner = session?.user?.id === user.id;

  // フォロー状態の確認
  const isFollowing = session?.user?.id && !isOwner 
    ? await checkIsFollowing(user.id) 
    : false;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center">
          {user.image ? (
            <img className="w-24 h-24 mb-3 rounded-full shadow-lg object-cover" src={user.image} alt={user.name || 'プロフィール写真'} />
          ) : (
            <div className="w-24 h-24 mb-3 rounded-full shadow-lg bg-gray-200 flex items-center justify-center text-gray-400">No Img</div>
          )}
          <h5 className="mb-1 text-xl font-medium text-gray-900">{user.name}</h5>
          <span className="text-sm text-gray-500">{user.title}</span>
          <p className="text-sm text-center text-gray-600 my-4 whitespace-pre-wrap">{user.bio}</p>
          
          <div className="flex flex-wrap justify-center gap-3 mt-4 md:mt-6">
            <VCardButton user={{ name: user.name, title: user.title, email: user.email, website: user.website }} />
            
            {/* --- 条件分岐のデバッグ表示 --- */}
            
            {/* パターンA: 本人の場合 */}
            {isOwner && (
                <div className="px-4 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg border border-gray-200">
                    あなた自身です
                </div>
            )}
            
            {/* パターンB: 他人 かつ ログイン済み -> フォローボタン表示 */}
            {!isOwner && session?.user?.id && (
                <FollowButton 
                    targetUserId={user.id} 
                    isFollowingInitial={isFollowing} 
                />
            )}
            
            {/* パターンC: 未ログイン -> ログインボタン表示 */}
            {!session?.user?.id && (
                <a href="/login" className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 border border-indigo-200">
                    ログインしてフォロー
                </a>
            )}
          </div>
          
          <div className="flex mt-6 space-x-4 text-sm">
            {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Website</a>}
            {user.twitter && <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Twitter</a>}
            {user.instagram && <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Instagram</a>}
          </div>

          {/* --- 開発用デバッグ情報 (原因特定用) --- */}
          <div className="mt-8 p-3 w-full bg-slate-100 rounded text-xs text-slate-500 text-left overflow-hidden">
            <p className="font-bold border-b border-slate-300 mb-1 pb-1">デバッグ情報</p>
            <p>あなたのID: {session?.user?.id || "未ログイン"}</p>
            <p>相手のID: {user.id}</p>
            <p>本人判定(isOwner): {isOwner ? "YES" : "NO"}</p>
          </div>

        </div>
      </div>
    </div>
  );
}