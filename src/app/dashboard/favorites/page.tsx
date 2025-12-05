// src/app/dashboard/favorites/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateFavorites } from "@/actions/updateFavorites";
import Link from "next/link";

interface ProfileSummary {
    id: string;
    username: string | null;
    name: string | null;
    image: string | null;
    title: string | null;
}

interface FavoritesData {
    followingList: ProfileSummary[];
    top5Slots: (ProfileSummary | null)[];
}

const ITEMS_PER_PAGE = 10;

export default function FavoritesPage() {
    const { status } = useSession();
    const router = useRouter();

    const [followingList, setFollowingList] = useState<ProfileSummary[]>([]);
    // テキストボックスへの入力値（ユーザー名 または ID）
    const [inputs, setInputs] = useState<string[]>(Array(5).fill(''));
    
    // ページネーション用
    const [currentPage, setCurrentPage] = useState(1);
    
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchFavorites = useCallback(async () => {
        setIsFetching(true);
        try {
            const response = await fetch('/api/favorites');
            if (!response.ok) throw new Error("Fetch failed");
            
            const data: FavoritesData = await response.json();
            setFollowingList(data.followingList || []);
            
            // 既存の設定があれば、そのユーザー名(またはID)を初期値に入れる
            const newInputs = Array(5).fill('');
            data.top5Slots.forEach((user, index) => {
                if (user && index < 5) {
                    // 優先的にユーザー名を表示、なければID
                    newInputs[index] = user.username || user.id;
                }
            });
            setInputs(newInputs);

        } catch (err) {
            console.error(err);
            setError("データの読み込みに失敗しました。");
        } finally {
            setIsFetching(false);
        }
    }, []);

    useEffect(() => {
        if (status === "authenticated") fetchFavorites();
        if (status === "unauthenticated") router.push("/login");
    }, [status, router, fetchFavorites]);

    const handleInputChange = (index: number, value: string) => {
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");
        
        const result = await updateFavorites(inputs);

        if (result.success) {
            setSuccess("マイフィンガーを更新しました！");
            fetchFavorites(); 
        } else {
            setError(result.error || "保存に失敗しました。");
        }
        setIsSaving(false);
    };

    // ページネーションの計算
    const totalPages = Math.ceil(followingList.length / ITEMS_PER_PAGE);
    const currentList = followingList.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const copyToInput = (text: string) => {
        // 空いている最初のスロットを探して入力するヘルパー機能
        const emptyIndex = inputs.findIndex(val => val.trim() === '');
        if (emptyIndex !== -1) {
            handleInputChange(emptyIndex, text);
        } else {
            alert("空いている枠がありません。どれかを消してから追加してください。");
        }
    };

    if (status === "loading" || isFetching) return <div className="p-10 text-center">読み込み中...</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">マイフィンガー設定</h1>
            
            {error && <p className="mb-4 text-red-500 bg-red-50 p-3 rounded">{error}</p>}
            {success && <p className="mb-4 text-green-700 bg-green-50 p-3 rounded">{success}</p>}

            {/* --- 上部：入力フォーム (5つのテキストボックス) --- */}
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-10">
                <h2 className="text-lg font-bold mb-4 text-gray-700">Top 5 登録</h2>
                <p className="text-sm text-gray-500 mb-6">
                    マイフィンガーに登録したい人の「ユーザーID」または「ユーザー名」を入力してください。<br/>
                    下のリストからコピー、またはボタンで追加できます。
                </p>

                <div className="space-y-4">
                    {inputs.map((val, index) => (
                        <div key={index} className="flex items-center gap-3">
                            <span className="w-6 text-center font-bold text-gray-400">{index + 1}</span>
                            <input
                                type="text"
                                value={val}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                placeholder={`ユーザーID または ユーザー名を入力`}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            />
                            <button 
                                type="button" 
                                onClick={() => handleInputChange(index, '')}
                                className="text-gray-400 hover:text-red-500 text-sm"
                            >
                                クリア
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-8">
                    <button 
                        type="submit" 
                        disabled={isSaving} 
                        className="w-full py-3 px-4 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md disabled:bg-gray-400 transition-colors"
                    >
                        {isSaving ? "保存中..." : "変更を保存する"}
                    </button>
                </div>
            </form>

            {/* --- 下部：フォロワー(フォロー中)リスト --- */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-4 text-gray-700">フォロー中リスト ({followingList.length}人)</h2>
                
                {followingList.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
                        まだ誰もフォローしていません。<br/>
                        <Link href="/" className="text-indigo-600 underline">他のユーザーを探す</Link>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentList.map((user) => (
                                <div key={user.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                                    {/* サムネイル */}
                                    <Link href={`/${user.username || '#'}`} className="shrink-0 mr-3">
                                        {user.image ? (
                                            <img src={user.image} alt="" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">No Img</div>
                                        )}
                                    </Link>
                                    
                                    {/* 名前とID */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/${user.username || '#'}`} className="block font-bold text-gray-800 truncate hover:text-indigo-600">
                                            {user.name || "名称未設定"}
                                        </Link>
                                        <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                            <span>ID: {user.username || user.id}</span>
                                        </div>
                                    </div>

                                    {/* 追加ボタン */}
                                    <button
                                        onClick={() => copyToInput(user.username || user.id)}
                                        className="ml-2 px-3 py-1 text-xs font-bold text-white bg-gray-500 hover:bg-indigo-600 rounded transition-colors"
                                    >
                                        追加
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* ページネーション */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-6 gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded border disabled:opacity-50"
                                >
                                    前へ
                                </button>
                                <span className="px-3 py-1 text-gray-600">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 rounded border disabled:opacity-50"
                                >
                                    次へ
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}