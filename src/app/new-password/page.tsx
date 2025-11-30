// src/app/new-password/page.tsx

"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { newPassword } from "@/actions/new-password";
import Link from "next/link";

export default function NewPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
      <NewPasswordForm />
    </Suspense>
  );
}

function NewPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    startTransition(() => {
      newPassword({ password }, token).then((data) => {
        setError(data?.error);
        if (data?.success) {
          setSuccess(data.success);
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      });
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">新しいパスワード</h2>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm text-center">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm text-center">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">新しいパスワード</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700"
              disabled={isPending}
              required
              placeholder="******"
            />
          </div>
          <button
            type="submit"
            disabled={isPending}
            className={`w-full font-bold py-2 px-4 rounded transition-colors ${
              isPending ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isPending ? "変更中..." : "パスワードを変更"}
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