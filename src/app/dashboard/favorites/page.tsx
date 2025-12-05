// src/app/dashboard/favorites/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { updateFavorites } from "@/actions/updateFavorites";

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

const MAX_SLOTS = 5;

export default function FavoritesPage() {
    const { status } = useSession();
    const router = useRouter();

    const [followingList, setFollowingList] = useState<ProfileSummary[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>(Array(MAX_SLOTS).fill('')); 
    
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
            
            // トップ5のIDを抽出してセット
            const newSelectedIds = data.top5Slots.map(p => p?.id || '');
            setSelectedUserIds(newSelectedIds.slice(0, MAX_SLOTS));

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

    const handleSlotChange = (slotIndex: number, newUserId: string) => {
        // 重複チェック
        const isAlreadySelected = selectedUserIds.some((id, index) => 
            index !== slotIndex && id === newUserId && newUserId !== ''
        );
        
        if (isAlreadySelected) {
            alert("そのユーザーは既に他のスロットに選んでいます。");
            return;
        }

        const newSelectedUserIds = [...selectedUserIds];
        newSelectedUserIds[slotIndex] = newUserId;
        setSelectedUserIds(newSelectedUserIds);
        setSuccess("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");
        
        const validUserIds = selectedUserIds.filter(id => id.trim() !== '');
        const result = await updateFavorites(validUserIds);

        if (result.success) {
            setSuccess("設定を保存しました！");
            fetchFavorites(); 
        } else {
            setError(result.error || "保存に失敗しました。");
        }
        setIsSaving(false);
    };

    if (status === "loading" || isFetching) return <div className="p-10 text-center">読み込み中...</div>;
    if (status === "unauthenticated") return null;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">マイフィンガー設定 (トップ5)</h1>
            
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
                {error && <p className="mb-4 text-red-500 bg-red-50 p-3 rounded">{error}</p>}
                {success && <p className="mb-4 text-green-700 bg-green-50 p-3 rounded">{success}</p>}

                <div className="mb-8">
                    <p className="text-gray-600">
                        あなたがフォローしているユーザーの中から、特にアクセスしたい最大5人をダッシュボードに固定できます。
                    </p>
                    {followingList.length === 0 && (
                        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-md border border-yellow-200">
                            <strong>フォロー中のユーザーがいません。</strong><br/>
                            まずは他のユーザーのプロフィールページに行って「フォロー」ボタンを押してみましょう！
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    {selectedUserIds.map((userId, index) => {
                        const selectedProfile = followingList.find(p => p.id === userId);
                        return (
                            <div key={index} className="flex items-center gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                                <div className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full font-bold text-sm shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-grow">
                                    <select
                                        value={userId}
                                        onChange={(e) => handleSlotChange(index, e.target.value)}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-indigo-500 focus:border-indigo-500"
                                        disabled={isSaving}
                                    >
                                        <option value="">(未設定)</option>
                                        {followingList.map((profile) => (
                                            <option key={profile.id} value={profile.id}>
                                                {profile.name || profile.username || "名無し"} 
                                                {profile.title ? ` / ${profile.title}` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                {selectedProfile?.image && (
                                    <img src={selectedProfile.image} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8">
                    <button 
                        type="submit" 
                        disabled={isSaving || followingList.length === 0} 
                        className="w-full py-3 px-4 text-white font-bold bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md disabled:bg-gray-400 transition-colors"
                    >
                        {isSaving ? "保存中..." : "変更を保存する"}
                    </button>
                </div>
            </form>
        </div>
    );
}