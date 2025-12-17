// src/components/DashboardClient.tsx

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import { getProfileViewCount } from "@/actions/trackView";
import { linkNfcCard } from "@/actions/linkNfcCard";
import { QRCodeSVG } from 'qrcode.react';
import HamsaHand from "@/components/HamsaHand"; // ★新規追加

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

  // スロットは必ず5つ分の配列にする
  const [top5Slots, setTop5Slots] = useState<(ProfileSummary | null)[]>([null, null, null, null, null]);
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
          // 取得したデータをセット
          setTop5Slots(data.top5Slots || [null, null, null, null, null]); 
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

    // NFC紐付け処理 (裏で実行)
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

  if (status === "loading") return <p className="text-center mt-10 animate-pulse">読み込み中...</p>;
  if (status === "unauthenticated" || !session?.user) return <p className="text-center mt-10 text-red-500">アクセス権がありません。</p>;

  return (
    <div className="space-y-8 pb-20">
      
      {/* 1. メインビジュアル: Digital Hamsa Interface */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 via-purple-500 to-blue-500"></div>
        
        <div className="p-6 text-center">
            <h3 className="text-xs font-black text-gray-400 tracking-[0.2em] uppercase mb-1">Digital Hamsa</h3>
            <p className="text-[10px] text-gray-300 mb-4">Five Elements Protection</p>
            
            {isLoadingFavorites ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-sm animate-pulse">Initializing System...</div>
            ) : (
            <HamsaHand slots={top5Slots} isOwner={true} />
            )}

            <div className="mt-8 mb-2">
                <Link href="/dashboard/favorites" className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-6 py-3 rounded-full hover:bg-indigo-100 transition-colors shadow-sm">
                    <span>⚡</span> データを装備する (Edit Slots)
                </Link>
            </div>
        </div>
      </div>

      {/* 2. 情報グリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* プロフィールカード */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5">
            <div className="shrink-0 relative">
                {session.user.image ? (
                <img src={session.user.image} alt="You" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md" />
                ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold">No Img</div>
                )}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-gray-800 truncate">{session.user.name || 'No Name'}</p>
                <p className="text-xs text-gray-500 mb-1 truncate">{(session.user as any).username ? `@${(session.user as any).username}` : ''}</p>
                <Link href="/dashboard" className="text-xs text-indigo-500 font-bold hover:underline">
                    ログイン &gt;
                </Link>
            </div>
            <div className="text-center pl-4 border-l border-gray-100">
                <p className="text-2xl font-black text-gray-800">{viewCount}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Views</p>
            </div>
        </div>

        {/* 共有ツール */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Share Profile</h4>
            <div className="flex gap-2 mb-4">
                <input type="text" readOnly value={profileUrl} className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100" />
                <button onClick={copyUrlToClipboard} className="bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition-colors">
                    {copySuccess || 'Copy'}
                </button>
            </div>
            <div className="flex justify-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                 {profileUrl ? (
                    <QRCodeSVG value={profileUrl} size={100} level="L" className="opacity-90" />
                 ) : null}
            </div>
        </div>

      </div>
    </div>
  );
}