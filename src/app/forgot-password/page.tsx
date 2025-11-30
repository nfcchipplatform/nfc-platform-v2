// src/app/forgot-password/page.tsx

"use client";

import { useState, useTransition } from "react";
import { reset } from "@/actions/reset";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(() => {
      reset(email)
        .then((data) => {
          if (data?.error) setError(data.error);
          if (data?.success) setSuccess(data.success);
        })
        .catch(() => {
          setError("予期せぬエラーが発生しました。");
        });
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">パスワードリセット</h2>
        
        <p className="text-sm text-gray-600 mb-6 text-center">
          登録したメールアドレスを入力してください。<br/>
          リセット用のリンクを送信します。
        </p>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">メールアドレス</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isPending}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isPending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isPending ? "送信中..." : "メールを送信"}
          </button>
        </form>

        <div className="text-center mt-4 border-t pt-4">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            ログイン画面に戻る
          </Link>
        </div>
      </div>
    </div>
  );
}