// src/app/login/page.tsx

"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const cardId = searchParams.get('cardId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        console.log("ログイン成功。ダッシュボードへ移動します。");
        
        const targetUrl = cardId 
          ? `/dashboard?cardId=${cardId}&link=true` 
          : '/dashboard';
        
        window.location.href = targetUrl;
      } else {
        setError('メールアドレスまたはパスワードが正しくありません。');
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('予期せぬエラーが発生しました。');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">ログイン</h2>
        
        {/* カード連携の案内 */}
        {cardId && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-center">
            <p className="font-bold text-sm">NFCカード連携</p>
            <p className="text-xs mt-1">ログインするとカードがアカウントに紐付けられます</p>
            <p className="text-[10px] mt-1 text-indigo-400 font-mono">{cardId}</p>
          </div>
        )}

        {error && <p className="mb-4 text-red-500 text-center text-sm font-medium">{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">メールアドレス</label>
            <input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="shadow border rounded w-full py-2 px-3 text-gray-700" 
              required 
              disabled={isLoading} 
            />
          </div>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">パスワード</label>
            <input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="shadow border rounded w-full py-2 px-3 text-gray-700" 
              required 
              disabled={isLoading} 
            />
          </div>

          {/* ★ 追加箇所: パスワードを忘れた場合のリンク ★ */}
          <div className="flex justify-end mb-6">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              パスワードをお忘れですか？
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full font-bold py-3 px-4 rounded transition-colors ${
                isLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLoading ? 'ログイン中...' : 'ログインする'}
            </button>
          </div>
          
          <div className="text-center mt-6 border-t pt-6">
            <p className="text-sm text-gray-600 mb-2">アカウントをお持ちでない場合</p>
            <Link href={cardId ? `/register?cardId=${cardId}` : "/register"} className="text-blue-600 font-bold hover:underline">
              新規登録はこちら
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
