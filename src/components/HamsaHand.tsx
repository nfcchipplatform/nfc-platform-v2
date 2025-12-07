// src/components/HamsaHand.tsx

"use client";

import Link from "next/link";
import { ThemeConfig, THEMES } from "@/lib/themeConfig";

interface ProfileSummary {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
  title: string | null;
}

interface HamsaHandProps {
  slots: (ProfileSummary | null)[]; 
  isOwner?: boolean;
  themeId?: string; // テーマIDを受け取る
}

const ELEMENT_LABELS = [
  { name: "親指", label: "火 (Fire)",   pos: "bottom-0 -left-2" },
  { name: "人差", label: "風 (Wind)",   pos: "top-12 -left-4" },
  { name: "中指", label: "空 (Void)",   pos: "-top-8 left-1/2 -translate-x-1/2" },
  { name: "薬指", label: "地 (Earth)",  pos: "top-12 -right-4" },
  { name: "小指", label: "水 (Water)",  pos: "bottom-0 -right-2" },
];

export default function HamsaHand({ slots, isOwner = false, themeId = "default" }: HamsaHandProps) {
  // テーマ情報を取得
  const theme = THEMES[themeId] || THEMES["default"];

  return (
    <div className={`relative w-full max-w-[280px] sm:max-w-[320px] mx-auto aspect-square my-10 ${theme.fontClass}`}>
      
      {/* --- 背景パターン (テーマによって切り替え) --- */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
         {theme.pattern === 'mandala' && (
             <div className="w-[120%] h-[120%] border-[1px] border-dashed border-current rounded-full animate-[spin_60s_linear_infinite]" style={{ color: theme.accentColor }}></div>
         )}
         {theme.pattern === 'grid' && (
             <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
         )}
         <div className="absolute w-[80%] h-[80%] border-[1px] border-current rounded-full opacity-30" style={{ color: theme.accentColor }}></div>
      </div>

      {/* --- 中心の「目」 (The Eye) --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div 
          className="relative w-24 h-24 rounded-full shadow-2xl flex flex-col items-center justify-center border-4 z-20 transition-transform hover:scale-105 overflow-hidden bg-white"
          style={{ borderColor: theme.accentColor }}
        >
            <div className="text-3xl mb-1">👁️</div>
            <p className="text-[8px] font-bold tracking-widest uppercase" style={{ color: theme.accentColor }}>HAMSA</p>
            
            {/* サイバーテーマの場合のスキャンライン演出 */}
            {theme.id === 'cyber' && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/10 to-transparent animate-pulse"></div>
            )}
        </div>
      </div>

      {/* --- 5本の指 --- */}
      {ELEMENT_LABELS.map((el, index) => {
        const user = slots[index];
        // テーマから各指の色設定を取得
        const colorClass = theme.elementColors[index] || "border-gray-200 bg-gray-50 text-gray-500";

        return (
          <div key={index} className={`absolute ${el.pos} flex flex-col items-center w-20 z-10`}>
            
            {/* 元素ラベル */}
            <span className={`text-[9px] font-bold uppercase tracking-tight mb-1 px-2 py-0.5 rounded-full shadow-sm border border-white/50 backdrop-blur-sm ${colorClass}`}>
              {el.label}
            </span>

            {/* アイコン本体 */}
            <div className={`relative w-16 h-16 rounded-full border-2 shadow-lg overflow-hidden transition-transform hover:scale-110 active:scale-95 ${colorClass}`}>
              {user ? (
                <Link href={`/${user.username}`} className="block w-full h-full relative group">
                  {user.image ? (
                    <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-70 text-xs font-bold">
                      {user.name?.[0] || "ID"}
                    </div>
                  )}
                  {/* ホバー効果 */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] text-white font-bold">OPEN</span>
                  </div>
                </Link>
              ) : (
                <Link href={isOwner ? "/dashboard/favorites" : "#"} className="flex flex-col items-center justify-center w-full h-full opacity-50 hover:opacity-100 transition-opacity">
                  <span className="text-xl font-light">+</span>
                  <span className="text-[8px]">ADD</span>
                </Link>
              )}
            </div>

            {/* ユーザー名ラベル */}
            <div className="mt-1 w-24 text-center">
                <p className={`text-[10px] font-bold truncate px-2 py-0.5 rounded shadow-sm inline-block max-w-full backdrop-blur-md ${theme.id === 'cyber' ? 'bg-black/80 text-white' : 'bg-white/80 text-gray-700'}`}>
                {user ? (user.name || "No Name") : "Empty"}
                </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}