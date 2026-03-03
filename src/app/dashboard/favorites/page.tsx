// src/app/dashboard/favorites/page.tsx

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
    top5Slots: (ProfileSummary | null)[];
}

// 五大元素の定義 (設定画面用)
const SLOT_CONFIG = [
  { id: 1, name: "人差", element: "風 (Wind)",   desc: "伝達・SNS・拡散",   color: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
  { id: 2, name: "中指", element: "空 (Void)",   desc: "秘密・削除・虚空",   color: "border-violet-500",  bg: "bg-violet-50",  text: "text-violet-700" },
  { id: 3, name: "薬指", element: "地 (Earth)",  desc: "資産・決済・所有",   color: "border-amber-500",   bg: "bg-amber-50",   text: "text-amber-700" },
  { id: 4, name: "小指", element: "水 (Water)",  desc: "感情・治癒・連絡",   color: "border-cyan-500",    bg: "bg-cyan-50",    text: "text-cyan-700" },
];

export default function FavoritesPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [inputs, setInputs] = useState<string[]>(Array(5).fill(''));
    const [suggestions, setSuggestions] = useState<Record<number, ProfileSummary[]>>({
        1: [],
        2: [],
        3: [],
        4: [],
    });
    const [isSuggesting, setIsSuggesting] = useState<Record<number, boolean>>({
        1: false,
        2: false,
        3: false,
        4: false,
    });
    const [openSlot, setOpenSlot] = useState<number | null>(null);
    const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout> | null>>({});
    const abortControllers = useRef<Record<number, AbortController | null>>({});
    const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const fetchFavorites = useCallback(async () => {
        if (!session?.user) return;
        
        setIsFetching(true);
        try {
            const response = await fetch('/api/favorites');
            if (!response.ok) throw new Error("Fetch failed");
            
            const data: FavoritesData = await response.json();
            const newInputs = Array(5).fill('');
            data.top5Slots.forEach((user, index) => {
                if (user && index > 0 && index < 5) {
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
    }, [session]);

    useEffect(() => {
        if (status === "authenticated") fetchFavorites();
        if (status === "unauthenticated") router.push("/login");
    }, [status, router, fetchFavorites]);

    const scheduleSearch = (index: number, value: string) => {
        const query = value.trim();

        if (debounceTimers.current[index]) {
            clearTimeout(debounceTimers.current[index] as ReturnType<typeof setTimeout>);
        }

        if (abortControllers.current[index]) {
            abortControllers.current[index]?.abort();
        }

        if (!query) {
            setIsSuggesting((prev) => ({ ...prev, [index]: false }));
            setSuggestions((prev) => ({ ...prev, [index]: [] }));
            return;
        }

        setIsSuggesting((prev) => ({ ...prev, [index]: true }));

        debounceTimers.current[index] = setTimeout(async () => {
            const controller = new AbortController();
            abortControllers.current[index] = controller;
            try {
                const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                });
                if (!response.ok) throw new Error("Search failed");
                const data = await response.json();
                setSuggestions((prev) => ({ ...prev, [index]: data.users || [] }));
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    console.error(err);
                    setSuggestions((prev) => ({ ...prev, [index]: [] }));
                }
            } finally {
                setIsSuggesting((prev) => ({ ...prev, [index]: false }));
            }
        }, 300);
    };

    const handleInputChange = (index: number, value: string, options?: { skipSearch?: boolean }) => {
        const shouldSkipSearch = options?.skipSearch ?? false;
        const newInputs = [...inputs];
        newInputs[index] = value;
        setInputs(newInputs);
        setSuccess("");
        setError("");
        if (!shouldSkipSearch && index > 0) {
            setOpenSlot(index);
            scheduleSearch(index, value);
        }
    };

    const handleSuggestionSelect = (index: number, user: ProfileSummary) => {
        const value = user.username || user.id;
        handleInputChange(index, value, { skipSearch: true });
        setSuggestions((prev) => ({ ...prev, [index]: [] }));
        setOpenSlot(null);
    };

    const handleInputFocus = (index: number) => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
        setOpenSlot(index);
        if (inputs[index]) {
            scheduleSearch(index, inputs[index]);
        }
    };

    const handleInputBlur = () => {
        if (blurTimer.current) clearTimeout(blurTimer.current);
        blurTimer.current = setTimeout(() => setOpenSlot(null), 150);
    };

    useEffect(() => {
        return () => {
            Object.values(debounceTimers.current).forEach((timer) => {
                if (timer) clearTimeout(timer);
            });
            Object.values(abortControllers.current).forEach((controller) => controller?.abort());
            if (blurTimer.current) clearTimeout(blurTimer.current);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        setSuccess("");
        
        const inputsForSave = [...inputs];
        inputsForSave[0] = "";
        const result = await updateFavorites(inputsForSave);

        if (result.success) {
            setSuccess("五大元素スロットを更新しました！");
            fetchFavorites(); 
        } else {
            setError(result.error || "保存に失敗しました。");
        }
        setIsSaving(false);
    };

    if (status === "loading" || isFetching) return <div className="p-10 text-center animate-pulse">読み込み中...</div>;

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800">ネイル設定 / 検索</h1>
                <Link href="/dashboard" className="text-sm text-gray-500 hover:text-indigo-600">
                    ← ダッシュボードへ戻る
                </Link>
            </div>
            <p className="mb-8 text-sm text-gray-500">
                親指はあなた自身のプロフィールで固定です。人差・中指・薬指・小指に「ユーザーID」または「ユーザーネーム」を入力して装備できます。
            </p>
            
            {error && <p className="mb-6 text-red-500 bg-red-50 p-4 rounded-lg font-bold border border-red-200">{error}</p>}
            {success && <p className="mb-6 text-green-700 bg-green-50 p-4 rounded-lg font-bold border border-green-200">{success}</p>}

            <form onSubmit={handleSubmit} className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* 5つのスロットカード */}
                    {SLOT_CONFIG.map((slot) => (
                        <div key={slot.id} className={`relative p-4 sm:p-5 rounded-xl border-2 bg-white shadow-sm transition-shadow hover:shadow-md ${slot.color} min-h-[180px] flex flex-col`}>
                            {/* 属性ラベルは非表示 */}
                            {/* <div className={`absolute top-0 right-0 px-2 sm:px-3 py-1 rounded-bl-lg rounded-tr-lg text-[9px] sm:text-[10px] font-bold uppercase tracking-wider ${slot.bg} ${slot.text}`}>
                                {slot.element}
                            </div> */}
                            
                            <div className="mb-3 mt-2 pr-2">
                                <h3 className="font-bold text-gray-800 text-sm sm:text-base">{slot.name}</h3>
                                {/* 説明文は非表示 */}
                                {/* <p className="text-[10px] text-gray-400">{slot.desc}</p> */}
                            </div>

                            <div className="relative flex flex-col sm:flex-row gap-2 mt-auto">
                                <input
                                    type="text"
                                    value={inputs[slot.id]}
                                    onChange={(e) => handleInputChange(slot.id, e.target.value)}
                                    onFocus={() => handleInputFocus(slot.id)}
                                    onBlur={handleInputBlur}
                                    placeholder="ユーザーID または ユーザーネーム"
                                    className="flex-1 min-w-0 bg-gray-50 border border-gray-200 rounded px-2 sm:px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                                {openSlot === slot.id && inputs[slot.id].trim() && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                                        {isSuggesting[slot.id] && (
                                            <div className="px-3 py-2 text-xs text-gray-400">検索中...</div>
                                        )}
                                        {!isSuggesting[slot.id] && suggestions[slot.id].length === 0 && (
                                            <div className="px-3 py-2 text-xs text-gray-400">一致するユーザーがいません</div>
                                        )}
                                        {suggestions[slot.id].map((user) => (
                                            <button
                                                type="button"
                                                key={user.id}
                                                onMouseDown={() => handleSuggestionSelect(slot.id, user)}
                                                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-indigo-50 transition-colors text-left"
                                            >
                                                {user.image ? (
                                                    <img
                                                        src={user.image}
                                                        alt=""
                                                        className="w-7 h-7 rounded-full object-cover bg-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-500">
                                                        ID
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                        {user.name || "No Name"}
                                                    </p>
                                                    <p className="text-xs text-gray-400 truncate">
                                                        @{user.username || user.id}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            
                            {/* クリアボタン */}
                            {inputs[slot.id] && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        handleInputChange(slot.id, '', { skipSearch: true });
                                        setSuggestions((prev) => ({ ...prev, [slot.id]: [] }));
                                        setOpenSlot(null);
                                    }}
                                    className="text-[10px] text-red-400 mt-2 hover:underline block text-right w-full"
                                >
                                    解除する
                                </button>
                            )}
                        </div>
                    ))}

                    {/* 保存ボタン */}
                    <div className="flex items-stretch">
                        <button 
                            type="submit" 
                            disabled={isSaving} 
                            className="w-full rounded-xl bg-gray-900 text-white font-bold text-lg shadow-lg hover:bg-black transition-transform active:scale-95 disabled:bg-gray-400 flex flex-col items-center justify-center gap-2 min-h-[180px]"
                        >
                            {isSaving ? (
                                <span>保存中...</span>
                            ) : (
                                <>
                                    <span>装備完了</span>
                                    <span className="text-xs font-normal opacity-70">変更を保存する</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>
            </form>

        </div>
    );
}