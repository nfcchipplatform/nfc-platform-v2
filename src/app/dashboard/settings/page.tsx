// src/app/dashboard/settings/page.tsx

"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react"; // signOutを追加
import { useRouter } from "next/navigation";
import Link from "next/link"; // Linkを追加
import { unlinkNfcCard } from "@/actions/unlinkNfcCard";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // NFCカードの紐付けを解除する処理
  const handleUnlink = async () => {
    if (!confirm("本当にNFCカードとの紐付けを解除しますか？")) {
      return;
    }
    setIsLoading(true);
    setMessage('');
    setError('');

    const result = await unlinkNfcCard();

    if (result.success) {
      setMessage("NFCカードの紐付けを解除しました。");
      await update();
    } else {
      setError(result.error || "解除に失敗しました。");
    }
    setIsLoading(false);
  };

  // ログアウト処理
  const handleLogout = () => {
    if (confirm("ログアウトしますか？")) {
      signOut({ callbackUrl: "/login" });
    }
  };

  if (status === "loading") {
    return <div className="text-center p-10">読み込み中...</div>;
  }
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }
  
  const nfcCardId = (session?.user as any)?.nfcCardId;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">アカウント設定</h1>
      
      {message && <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">{message}</div>}
      {error && <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="space-y-8">
        {/* 1. NFCカード連携 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">NFCカード連携</h2>
          <div className="border-t border-gray-200 pt-4">
            {nfcCardId ? (
              <>
                <p className="text-gray-600 mb-2">
                  現在、あなたのアカウントには以下のNFCカードが紐付けられています。
                </p>
                <div className="flex items-center gap-4 mb-4">
                  <p className="text-gray-800 font-mono bg-gray-100 px-3 py-2 rounded">
                    {nfcCardId}
                  </p>
                </div>
                <button
                  onClick={handleUnlink}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-500 rounded-md hover:bg-red-600 disabled:bg-gray-400 transition-colors"
                >
                  {isLoading ? "解除中..." : "NFCカードの紐付けを解除する"}
                </button>
              </>
            ) : (
              <div className="text-gray-600">
                <p className="mb-2">現在、アカウントに紐付けられているNFCカードはありません。</p>
                <p className="text-sm text-gray-500">新しいカードを紐付けるには、カードをスキャンしてログインしてください。</p>
              </div>
            )}
          </div>
        </div>

        {/* 2. セキュリティ設定 (パスワード変更) */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">セキュリティ</h2>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 mb-4">
              パスワードを変更したい場合は、以下のリンクからリセット手続きを行ってください。
            </p>
            <Link
              href="/forgot-password"
              className="inline-block px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md hover:bg-indigo-100 transition-colors"
            >
              パスワード変更画面へ（リセット）
            </Link>
          </div>
        </div>

        {/* 3. ログアウト */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-700">アカウント操作</h2>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-gray-600 mb-4">
              この端末からログアウトします。
            </p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}