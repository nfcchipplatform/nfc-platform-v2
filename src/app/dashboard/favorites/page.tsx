// src/app/dashboard/favorites/page.tsx (本当に最終確定版)

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// updateFavoritesサーバーアクションのみをインポート
import { updateFavorites } from "@/actions/updateFavorites";

export default function FavoritesPage() {
  const { status } = useSession();
  const router = useRouter();

  const [slots, setSlots] = useState<string[]>(['', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ページ読み込み時に、APIから現在の設定を取得する
  useEffect(() => {
    const fetchFavorites = async () => {
      setIsFetching(true);
      try {
        const response = await fetch('/api/favorites'); // ★★★ APIルートを呼び出します ★★★
        if (!response.ok) {
          throw new Error("Failed to fetch favorites");
        }
        const data = await response.json();
        if (data.slots) {
          setSlots(data.slots);
        }
      } catch (err) {
        setError("設定の読み込みに失敗しました。");
      } finally {
        setIsFetching(false);
      }
    };
    
    if (status === "authenticated") {
      fetchFavorites();
    }
    if (status === "unauthenticated") {
        router.push("/login");
    }
  }, [status, router]);

  const handleSlotChange = (index: number, value: string) => {
    const newSlots = [...slots];
    newSlots[index] = value;
    setSlots(newSlots);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    const result = await updateFavorites(slots);

    if (result.success) {
      setSuccess("お気に入りを保存しました！");
    } else {
      setError(result.error || "保存に失敗しました。");
    }
    setIsLoading(false);
  };

  if (status === "loading" || isFetching) {
    return <div className="text-center p-10">読み込み中...</div>;
  }
  
  if (status === "unauthenticated") {
    return null;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">お気に入りスロット設定</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {success && <p className="mb-4 text-green-500">{success}</p>}

        <p className="text-gray-600 mb-6">
          ダッシュボードに表示する、自分や他の人のプロフィールURLまたはユーザー名を設定します。（最大5件）
        </p>

        <div className="space-y-4">
          {slots.map((url, index) => (
            <div key={index}>
              <label htmlFor={`slot-${index}`} className="block text-sm font-medium text-gray-700">
                スロット {index + 1}
              </label>
              <input
                type="text"
                id={`slot-${index}`}
                value={url}
                onChange={(e) => handleSlotChange(index, e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder="https://... or username"
              />
            </div>
          ))}
        </div>

        <div className="mt-6">
          <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">
            {isLoading ? "保存中..." : "保存する"}
          </button>
        </div>
      </form>
    </div>
  );
}