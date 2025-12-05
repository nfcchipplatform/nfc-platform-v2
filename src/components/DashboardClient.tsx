// src/components/DashboardClient.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { getProfileViewCount } from "@/actions/trackView";
import { linkNfcCard } from "@/actions/linkNfcCard";
import { QRCodeSVG } from 'qrcode.react';

interface ProfileSummary {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
    title: string | null;
}

export default function DashboardClient() {
  const { data: session, status, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasLinkedRef = useRef(false);

  const [top5Slots, setTop5Slots] = useState<(ProfileSummary | null)[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [viewCount, setViewCount] = useState(0);
  const [copySuccess, setCopySuccess] = useState('');
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin);

    if (status !== "authenticated" || !session?.user?.id) return;
    const userId = session.user.id;

    const fetchFavoritesData = async () => {
      try {
        const res = await fetch('/api/favorites');
        if (res.ok) {
          const data = await res.json();
          setTop5Slots(data.top5Slots || []); 
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setIsLoadingFavorites(false);
      }
    };

    const fetchViewCountData = async () => {
      const result = await getProfileViewCount(userId);
      if (result.success) setViewCount(result.count || 0);
    };

    const handleLinkCard = async () => {
      const cardId = searchParams.get('cardId');
      const shouldLink = searchParams.get('link');
      if (cardId && shouldLink === 'true' && !hasLinkedRef.current) {
        hasLinkedRef.current = true;
        const result = await linkNfcCard(userId, cardId);
        if (result.success) {
          alert('NFCカードをアカウントに紐付けました！');
          await update();
        } else {
          alert(`エラー: ${result.error}`);
        }
        router.replace('/dashboard', { scroll: false });
      }
    };

    fetchFavoritesData();
    fetchViewCountData();
    handleLinkCard();

  }, [status, session, searchParams, router, update]);

  const profileUrl = (status === "authenticated" && origin) 
    ? `${origin}/${(session.user as any).username || ''}` 
    : "";

  const copyUrlToClipboard = () => {
    if (!profileUrl) return;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopySuccess('完了');
      setTimeout(() => setCopySuccess(''), 2000);
    });
  };

  if (status === "loading") return <p className="text-center mt-10">読み込み中...</p>;
  if (status === "unauthenticated" || !session?.user) return <p className="text-center mt-10 text-red-500">アクセス権がありません。</p>;

  return (
    <div className="space-y-8">
      {/* マイフィンガー (Top 5) - シンプルなデザインに戻しました */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
        <h3 className="text-lg font-bold mb-4 text-gray-800">マイフィンガー</h3>
        
        {isLoadingFavorites ? (
          <div className="p-4 text-center text-gray-500">Reading...</div>
        ) : (
          <div className="flex justify-between gap-2 overflow-x-auto pb-2">
            {top5Slots.every(slot => slot === null) ? (
                 <div className="w-full text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-sm text-gray-500 mb-2">未設定</p>
                    <Link href="/dashboard/favorites" className="text-indigo-600 font-bold text-sm hover:underline">
                        設定する
                    </Link>
                 </div>
            ) : (
                top5Slots.map((profile, index) => (
                  <div key={index} className="flex-1 text-center min-w-[60px] max-w-[80px]">
                    {profile ? (
                      <Link href={`/${profile.username}`} className="block group">
                        {/* シンプルな円形アイコン */}
                        <div className="mx-auto w-12 h-12 sm:w-14 sm:h-14 mb-2">
                            {profile.image ? (
                              <img src={profile.image} alt={profile.name || ''} className="w-full h-full rounded-full object-cover shadow-sm group-hover:opacity-80 transition-opacity" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-[10px] text-gray-500">
                                No Img
                              </div>
                            )}
                        </div>
                        <p className="text-[10px] font-bold text-gray-700 truncate px-1 group-hover:text-indigo-600">{profile.name || "NoName"}</p>
                      </Link>
                    ) : (
                      <Link href="/dashboard/favorites" className="block group opacity-30 hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center border border-gray-300">
                          <span className="text-gray-400 text-lg">+</span>
                        </div>
                        <p className="text-[10px] text-gray-400">Add</p>
                      </Link>
                    )}
                  </div>
                ))
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
          {/* プロフィールプレビュー */}
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <h3 className="text-lg font-bold mb-4 text-gray-800 text-left">あなた</h3>
            {session.user.image ? (
              <img src={session.user.image} alt="あなた" className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-3 object-cover border border-gray-200 shadow-sm" />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center text-gray-400">No Img</div>
            )}
            <p className="font-bold text-lg text-gray-800">{session.user.name || '名前未設定'}</p>
            <p className="text-sm text-gray-500 mb-4">{(session.user as any).title || ''}</p>
            <Link href="/dashboard/profile" className="inline-block px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded hover:bg-gray-200 transition-colors">
                編集する
            </Link>
          </div>
          
          {/* インサイト */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-2 text-gray-800">閲覧数</h3>
            <div className="text-center py-2">
                <p className="text-4xl font-black text-indigo-600 tracking-tight">{viewCount}</p>
                <p className="text-xs text-gray-400 mt-1">views</p>
            </div>
          </div>
        </div>

        {/* 共有ツール */}
        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4 text-gray-800">共有ツール</h3>
            <div className="flex flex-col gap-8">
              <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">プロフィールURL</label>
                  <div className="flex items-center">
                      <input type="text" readOnly value={profileUrl} className="w-full p-3 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 font-mono text-sm focus:outline-none" />
                      <button onClick={copyUrlToClipboard} className="bg-indigo-600 text-white px-6 py-3 rounded-r-md hover:bg-indigo-700 font-bold transition-colors min-w-[100px]">
                        {copySuccess || 'コピー'}
                      </button>
                  </div>
              </div>
              
              <div className="border-t pt-6 flex flex-col sm:flex-row gap-6">
                <div>
                    <p className="text-sm font-bold text-gray-700 mb-3">QRコード</p>
                    <div className="bg-white p-2 rounded-lg border border-gray-200 inline-block">
                        {profileUrl ? (
                           <QRCodeSVG value={profileUrl} size={120} level="H" includeMargin={true} />
                        ) : (
                           <div className="w-[120px] h-[120px] bg-gray-100 flex items-center justify-center text-xs text-gray-400">Loading...</div>
                        )}
                    </div>
                </div>
                <div className="flex-1 flex items-center">
                    <p className="text-sm text-gray-600 leading-relaxed">
                        このQRコードやURLを相手に伝えて、アクセスしてもらいましょう。<br/>
                        相手があなたをフォローすると、お互いのマイフィンガーに追加できるようになります。
                    </p>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}