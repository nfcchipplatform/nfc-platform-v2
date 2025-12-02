// src/components/DashboardClient.tsx



"use client";



import { useState, useEffect, useRef } from "react";

import { useSession } from "next-auth/react";

import { useSearchParams, useRouter } from 'next/navigation';

import Link from "next/link";

import { getProfileViewCount } from "@/actions/trackView";

import { linkNfcCard } from "@/actions/linkNfcCard";

import { QRCodeSVG } from 'qrcode.react'; // ★ QRコードライブラリを追加



interface FavoriteProfile {

  username: string | null;

  name: string | null;

  image: string | null;

}



export default function DashboardClient() {

  const { data: session, status, update } = useSession();

  const searchParams = useSearchParams();

  const router = useRouter();

  const hasLinkedRef = useRef(false);



  const [favoriteSlots, setFavoriteSlots] = useState<string[]>([]);

  const [favoriteProfiles, setFavoriteProfiles] = useState<FavoriteProfile[]>([]);

 

  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  const [viewCount, setViewCount] = useState(0);

  const [copySuccess, setCopySuccess] = useState('');

  const [origin, setOrigin] = useState(''); // ★ URL生成用のオリジン状態を追加



  useEffect(() => {

    // クライアントサイドでのみ window.location.origin を取得（エラー防止）

    if (typeof window !== 'undefined') {

      setOrigin(window.location.origin);

    }



    // 認証されていない、またはロード中の場合は何もしない

    if (status !== "authenticated" || !session?.user?.id) {

      return;

    }



    const userId = session.user.id;



    // --- 1. お気に入りデータの取得関数 ---

    const fetchFavoritesData = async () => {

      try {

        const res = await fetch('/api/favorites');

        if (res.ok) {

          const data = await res.json();

          setFavoriteSlots(data.slots || []);

          setFavoriteProfiles(data.profiles || []);

        }

      } catch (error) {

        console.error("お気に入りデータ取得エラー:", error);

      } finally {

        setIsLoadingFavorites(false);

      }

    };



    // --- 2. 閲覧数の取得関数 ---

    const fetchViewCountData = async () => {

      const result = await getProfileViewCount(userId);

      if (result.success) {

        setViewCount(result.count || 0);

      }

    };



    // --- 3. NFCカード紐付け処理 ---

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



    // 各処理を実行

    fetchFavoritesData();

    fetchViewCountData();

    handleLinkCard();



  }, [status, session, searchParams, router, update]);



  // プロフィールURLの生成（安全にoriginを使用）

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



  if (status === "loading") {

    return <p className="text-gray-800 text-center mt-10">読み込み中...</p>;

  }

  if (status === "unauthenticated" || !session?.user) {

    return <p className="text-red-500 text-center mt-10">アクセス権がありません。</p>;

  }



  return (

    <div className="space-y-8">

      {/* お気に入りスロット */}

      <div className="bg-white p-6 rounded-lg shadow">

        <h3 className="text-lg font-bold mb-4 text-gray-800">マイフィンガー</h3>

       

        {isLoadingFavorites ? (

          <div className="flex justify-center p-4">

            <p className="text-gray-500 animate-pulse">データを読み込んでいます...</p>

          </div>

        ) : (

          <div className="flex space-x-4 overflow-x-auto pb-2">

            {favoriteSlots.length === 0 && (

               <p className="text-sm text-gray-400 w-full text-center">お気に入りはまだ設定されていません</p>

            )}

            {favoriteSlots.map((slot, index) => {

              const profile = favoriteProfiles.find(p => p.username === slot);

              return (

                <div key={index} className="flex-1 text-center min-w-[80px]">

                  {profile ? (

                    <Link href={`/${profile.username}`} className="block group">

                      {profile.image ? (

                        <img src={profile.image} alt={profile.name || ''} className="w-16 h-16 rounded-full mx-auto mb-2 object-cover group-hover:opacity-80 transition-opacity border border-gray-200" />

                      ) : (

                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 group-hover:opacity-80 transition-opacity" />

                      )}

                      <p className="text-xs text-gray-600 truncate font-medium group-hover:text-blue-500">{profile.name || profile.username}</p>

                    </Link>

                  ) : slot ? (

                    <a href={slot} target="_blank" rel="noopener noreferrer" className="block group">

                       <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-2 flex items-center justify-center group-hover:opacity-80 transition-opacity border border-gray-200">

                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-400">

                           <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />

                         </svg>

                       </div>

                       <p className="text-xs text-gray-600 truncate group-hover:text-blue-500">外部リンク</p>

                    </a>

                  ) : (

                    <Link href="/dashboard/favorites" className="block group opacity-50 hover:opacity-100">

                        <div className="w-16 h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">

                            <span className="text-gray-300 text-2xl">+</span>

                        </div>

                        <p className="text-xs text-gray-400">未設定</p>

                    </Link>

                  )}

                </div>

              );

            })}

          </div>

        )}

      </div>



      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        <div className="md:col-span-1 space-y-8">

          {/* プロフィールプレビュー */}

          <div className="bg-white p-6 rounded-lg shadow">

            <h3 className="text-lg font-bold mb-4 text-gray-800">プロフィールプレビュー</h3>

            <div className="flex flex-col items-center">

                {session.user.image ? (

                  <img src={session.user.image} alt="プロフィールプレビュー" className="w-24 h-24 bg-gray-200 rounded-full mb-4 object-cover border border-gray-200" />

                ) : (

                  <div className="w-24 h-24 bg-gray-200 rounded-full mb-4 flex items-center justify-center text-gray-400">

                    No Img

                  </div>

                )}

                <p className="font-bold text-lg text-gray-800">{session.user.name || '名前未設定'}</p>

                <p className="text-sm text-gray-500 mb-4">{(session.user as any).title || '役職未設定'}</p>

                <Link href="/dashboard/profile" className="text-sm text-blue-600 hover:underline">

                    編集する

                </Link>

            </div>

          </div>

         

          {/* インサイト */}

          <div className="bg-white p-6 rounded-lg shadow">

            <h3 className="text-lg font-bold mb-4 text-gray-800">インサイト</h3>

            <div className="text-center py-4">

                <p className="text-4xl font-bold text-indigo-600">{viewCount}</p>

                <p className="text-gray-500 text-sm mt-2">総閲覧回数</p>

            </div>

          </div>

        </div>



        {/* 共有ツール (QRコード実装箇所) */}

        <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">

          <h3 className="text-lg font-bold mb-4 text-gray-800">共有ツール</h3>

            <div className="flex flex-col gap-8">

              <div>

                  <label className="text-sm font-bold text-gray-700 block mb-2">あなたのプロフィールURL</label>

                  <div className="flex items-center">

                      <input type="text" readOnly value={profileUrl} className="w-full p-3 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 font-mono text-sm" />

                      <button onClick={copyUrlToClipboard} className="bg-indigo-600 text-white px-6 py-3 rounded-r-md hover:bg-indigo-700 font-bold transition-colors min-w-[100px]">

                        {copySuccess || 'コピー'}

                      </button>

                  </div>

                  <p className="text-xs text-gray-500 mt-2">このURLをSNSのプロフィールやICチップに書き込んで共有しましょう。</p>

              </div>

             

              <div className="border-t pt-6">

                <p className="text-sm font-bold text-gray-700 mb-4">QRコード</p>

                <div className="flex items-center justify-center md:justify-start gap-6">

                    {/* ★ QRコード実装部分 ★ */}

                    <div className="bg-white p-2 rounded-lg border border-gray-200">

                        {profileUrl ? (

                           <QRCodeSVG

                             value={profileUrl}

                             size={128} // 検証プログラムに準拠した設定 (128px)

                             level="H"

                             includeMargin={true}

                           />

                        ) : (

                           <div className="w-32 h-32 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">

                             URL生成中...

                           </div>

                        )}

                    </div>

                    <div className="text-sm text-gray-600">

                        <p>スマートフォンで読み取ると、<br/>あなたのプロフィールページが開きます。</p>

                    </div>

                </div>

              </div>

            </div>

        </div>

      </div>

    </div>

  );

}