// src/app/[username]/page.tsx

import { PrismaClient } from "@prisma/client";
import { trackProfileView } from "@/actions/trackView";
import VCardButton from "@/components/VCardButton";
import DirectLinkInterstitial from "@/components/DirectLinkInterstitial";

const prisma = new PrismaClient();

interface UserProfilePageProps {
  params: {
    username: string;
  };
  // ▼▼▼ searchParamsを受け取れるようにpropsを追加 ▼▼▼
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UserProfilePage({ params, searchParams }: UserProfilePageProps) { // searchParamsを追加
  const { username } = params;

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
  
  // ▼▼▼ ダイレクトリンクのロジックを修正 ▼▼▼
  // URLに "from=interstitial" が含まれていない場合のみ、ダイレクトリンクを評価する
  const fromInterstitial = searchParams.from === 'interstitial';

  if (user.directLinkEnabled && user.directLinkUrl && !fromInterstitial) {
    return (
      <DirectLinkInterstitial 
        redirectUrl={user.directLinkUrl}
        profileUrl={`/${user.username}`}
      />
    );
  }
  // ▲▲▲ ▲▲▲ ▲▲▲

  // 通常のプロフィール表示
  await trackProfileView(user.id);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow-md p-8">
        <div className="flex flex-col items-center">
          {user.image ? (
            <img className="w-24 h-24 mb-3 rounded-full shadow-lg object-cover" src={user.image} alt={user.name || 'プロフィール写真'} />
          ) : (
            <div className="w-24 h-24 mb-3 rounded-full shadow-lg bg-gray-200" />
          )}
          <h5 className="mb-1 text-xl font-medium text-gray-900">{user.name}</h5>
          <span className="text-sm text-gray-500">{user.title}</span>
          <p className="text-sm text-center text-gray-600 my-4">{user.bio}</p>
          
          <div className="flex mt-4 space-x-3 md:mt-6">
            <VCardButton user={{ name: user.name, title: user.title, email: user.email, website: user.website }} />
          </div>
          
          <div className="flex mt-4 space-x-3 md:mt-6">
            {user.website && <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Website</a>}
            {user.twitter && <a href={user.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Twitter</a>}
            {user.instagram && <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Instagram</a>}
          </div>
        </div>
      </div>
    </div>
  );
}