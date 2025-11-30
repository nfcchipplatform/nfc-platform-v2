// src/app/page.tsx (修正版)

"use client";

import { useSession, signOut } from "next-auth/react"; // useCurrentUserの代わりにuseSessionを直接使う
import Link from "next/link";

export default function Home() {
  // sessionデータと、読み込み状態(status)を取得
  const { data: session, status } = useSession();

  // ローディング中の表示
  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <p>読み込み中...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-3xl font-bold mb-4">
          ようこそ！
        </h1>

        {/* ログインしている場合 (statusが'authenticated') */}
        {status === "authenticated" && session.user && (
          <div className="space-y-4">
            <p className="text-xl">
              こんにちは、<span className="font-semibold">{session.user.name || session.user.email}</span> さん
            </p>
            
            <div className="flex justify-center items-center gap-4">
              <Link href="/dashboard/profile" className="inline-block bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                プロフィールを編集する
              </Link>
              
              <button
                onClick={() => signOut()} // ログアウトボタン
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}

        {/* ログアウトしている場合 (statusが'unauthenticated') */}
        {status === "unauthenticated" && (
          <div className="space-y-4">
            <p className="text-xl">
              ログインしていません。
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                ログイン
              </Link>
              <Link href="/register" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                新規登録
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}