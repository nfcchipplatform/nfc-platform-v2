// src/app/register/page.tsx

"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // useRouterを追加
import Link from 'next/link';
import { signIn } from 'next-auth/react'; // 自動ログイン用に追加

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState(''); // 状況表示用
  
  const searchParams = useSearchParams();
  const router = useRouter(); // 追加
  const cardId = searchParams.get('cardId');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setStatusMessage('');
    setIsLoading(true);

    if (!email || !password || !username) {
      setError('必須項目が入力されていません。');
      setIsLoading(false);
      return;
    }

    try {
      // 1. 新規登録APIを叩く
      setStatusMessage('アカウントを作成中...');
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, username }),
      });

      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        data = { message: rawText };
      }

      if (res.ok) {
        // ★★★ 改良ポイント：登録成功後、すぐに自動ログインする ★★★
        console.log("登録成功。自動ログインを試みます。");
        setStatusMessage('登録完了！ 自動ログイン中...');

        const loginResult = await signIn('credentials', {
          redirect: false, // ページ遷移は自分で制御する
          email,
          password,
        });

        if (loginResult?.ok) {
          console.log("自動ログイン成功。ダッシュボードへ移動します。");
          setStatusMessage('ログイン成功！ ダッシュボードへ移動します...');
          
          // カードIDがある場合は、紐付けフラグ付きでダッシュボードへ
          const targetUrl = cardId 
            ? `/dashboard?cardId=${cardId}&link=true` 
            : '/dashboard';
          
          // 確実に移動させる
          window.location.href = targetUrl;
        } else {
          // 万が一自動ログインに失敗した場合
          console.error("自動ログイン失敗");
          window.location.href = '/login'; // 手動ログインへ誘導
        }

      } else {
        // 登録エラー時
        setError(data.message || '登録に失敗しました。');
        setIsLoading(false);
        setStatusMessage('');
      }

    } catch (err) {
      console.error("エラー:", err);
      setError('通信エラーが発生しました。');
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">新規登録</h2>
        
        {cardId && (
           <div className="mb-6 p-4 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg text-center">
             <p className="font-bold text-sm">NFCカード連携</p>
             <p className="text-xs mt-1">ID: {cardId}</p>
           </div>
        )}

        {/* 状況メッセージ（青） */}
        {statusMessage && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-800 rounded-lg text-center font-bold animate-pulse">
            ⏳ {statusMessage}
          </div>
        )}

        {/* エラーメッセージ（赤） */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center font-bold">
            ⚠️ {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">名前</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="shadow border rounded w-full py-2 px-3" disabled={isLoading} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">ユーザー名</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="shadow border rounded w-full py-2 px-3" required disabled={isLoading} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="shadow border rounded w-full py-2 px-3" required disabled={isLoading} />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">パスワード</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="shadow border rounded w-full py-2 px-3" required disabled={isLoading} />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-bold py-3 px-4 rounded transition-colors ${
              isLoading 
                ? 'bg-blue-400 text-white cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLoading ? '処理を実行中...' : '登録する'}
          </button>

          <div className="text-center mt-6 border-t pt-6">
             <Link href={cardId ? `/login?cardId=${cardId}` : "/login"} className="text-blue-600 font-bold hover:underline">
               ログイン画面へ戻る
             </Link>
          </div>
        </form>
      </div>
            {/* ▼▼▼ 追加箇所: フッターリンク ▼▼▼ */}
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
      {/* ▲▲▲ 追加ここまで ▲▲▲ */}
    </div>
  );
}