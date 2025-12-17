// src/app/page.tsx

"use client";

import { useSession, signOut } from "next-auth/react"; 
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-500 animate-pulse">読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          PONNU
        </h1>

        {/* ログイン済みの場合 */}
        {status === "authenticated" && session.user && (
          <div className="space-y-6">
            <div>
              <p className="text-lg text-gray-600">こんにちは、</p>
              <p className="text-xl font-bold text-gray-900 mt-1 break-words">
                {session.user.name || session.user.email}
              </p>
              <p className="text-lg text-gray-600">さん</p>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* ▼ 変更: 緑から青へ（メインアクション） */}
              <Link 
                href="/dashboard"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors"
              >
                ダッシュボード
              </Link>
              
              {/* ▼ 変更: 赤からグレーへ（サブアクション） */}
              <button
                onClick={() => signOut()} 
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg border border-gray-300 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}

        {/* 未ログインの場合 */}
        {status === "unauthenticated" && (
          <div className="space-y-6">
            <p className="text-gray-600">
              NFCプロフィールへようこそ。<br/>
              ログインして始めましょう。
            </p>
            <div className="flex flex-col gap-3">
              <Link 
                href="/login" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow transition-colors"
              >
                ログイン
              </Link>
              <Link 
                href="/register" 
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg border border-gray-300 transition-colors"
              >
                新規登録
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 flex items-center justify-center gap-6 text-xs text-gray-500">
        <a 
          href="https://ponnu.net/privacy-policy.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-800 hover:underline transition-colors"
        >
          プライバシーポリシー
        </a>
        <a 
          href="https://ponnu.net/terms-of-service.pdf" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-gray-800 hover:underline transition-colors"
        >
          利用規約
        </a>
      </div>

    </main>
  );
}