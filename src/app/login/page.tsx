// src/app/login/page.tsx

"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  
  // URLから cardId を取得
  const cardId = searchParams.get("cardId");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("メールアドレスまたはパスワードが間違っています");
        setIsLoading(false);
      } else {
        // --- 修正ポイント ---
        // router.push ではなく window.location.href を使用して確実に移動させる
        if (cardId) {
            window.location.href = `/dashboard?cardId=${cardId}&link=true`;
        } else {
            window.location.href = "/dashboard";
        }
      }
    } catch (err) {
      setError("予期せぬエラーが発生しました");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">ログイン</h1>

        {/* カード連携の案内表示 */}
        {cardId && (
           <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm text-center">
             <p className="font-bold mb-1">NFCカード連携</p>
             <p>ログインすると、このカード(ID:{cardId})が<br/>あなたのアカウントに紐付けられます。</p>
           </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isLoading}
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-gray-700">パスワード</label>
                <Link href="/forgot-password" className="text-xs text-indigo-600 hover:underline">
                    パスワードを忘れた場合
                </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded hover:bg-indigo-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">アカウントをお持ちでないですか？</p>
          <Link 
            href={cardId ? `/register?cardId=${cardId}` : "/register"} 
            className="text-indigo-600 font-bold hover:underline"
          >
            新規登録はこちら
          </Link>
        </div>
      </div>
    </div>
  );
}