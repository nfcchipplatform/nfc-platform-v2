// src/components/HamsaHand.tsx

"use client";

import Link from "next/link";

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
}

// 五大元素の定義 (色と配置)
const ELEMENTS = [
  { id: 0, name: "親指", label: "火 (Fire)",   color: "border-red-500",    bg: "bg-red-50",    text: "text-red-600",    pos: "bottom-0 -left-2" },   // 左下
  { id: 1, name: "人差", label: "風 (Wind)",   color: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600", pos: "top-12 -left-4" },  // 左上
  { id: 2, name: "中指", label: "空 (Void)",   color: "border-violet-500",  bg: "bg-violet-50",  text: "text-violet-600",  pos: "-top-8 left-1/2 -translate-x-1/2" }, // 真上
  { id: 3, name: "薬指", label: "地 (Earth)",  color: "border-amber-500",   bg: "bg-amber-50",   text: "text-amber-600",   pos: "top-12 -right-4" }, // 右上
  { id: 4, name: "小指", label: "水 (Water)",  color: "border-cyan-500",    bg: "bg-cyan-50",    text: "text-cyan-600",    pos: "bottom-0 -right-2" },  // 右下
];

export default function HamsaHand({ slots, isOwner = false }: HamsaHandProps) {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] mx-auto aspect-square my-10">
      
      {/* 背景: マンダラ・エフェクト */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
         <div className="w-[120%] h-[120%] border-[1px] border-dashed border-gray-400 rounded-full animate-[spin_60s_linear_infinite]"></div>
         <div className="absolute w-[80%] h-[80%] border-[1px] border-gray-300 rounded-full opacity-50"></div>
      </div>

      {/* 中心の「目」 (The Eye) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="relative w-24 h-24 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center border-4 border-indigo-900 z-20 transition-transform hover:scale-105">
            <div className="text-3xl mb-1">👁️</div>
            <p className="text-[8px] font-bold text-indigo-900 tracking-widest uppercase">HAMSA</p>
            <div className="absolute inset-0 rounded-full border-2 border-indigo-100 animate-ping opacity-20"></div>
        </div>
      </div>

      {/* 5本の指 (Radial Layout) */}
      {ELEMENTS.map((el, index) => {
        const user = slots[index];
        return (
          <div key={el.id} className={`absolute ${el.pos} flex flex-col items-center w-20 z-10`}>
            
            {/* 元素ラベル */}
            <span className={`text-[9px] font-bold uppercase tracking-tight mb-1 px-2 py-0.5 rounded-full ${el.bg} ${el.text} shadow-sm border border-white`}>
              {el.label}
            </span>

            {/* アイコン本体 */}
            <div className={`relative w-16 h-16 rounded-full border-2 ${el.color} shadow-lg bg-white overflow-hidden transition-transform hover:scale-110 active:scale-95`}>
              {user ? (
                <Link href={`/${user.username}`} className="block w-full h-full relative group">
                  {user.image ? (
                    <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-xs text-gray-400 font-bold">
                      {user.name?.[0] || "ID"}
                    </div>
                  )}
                  {/* ホバー効果 */}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[8px] text-white font-bold">OPEN</span>
                  </div>
                </Link>
              ) : (
                <Link href={isOwner ? "/dashboard/favorites" : "#"} className="flex flex-col items-center justify-center w-full h-full bg-gray-50 text-gray-300 hover:bg-gray-100 transition-colors">
                  <span className="text-xl font-light">+</span>
                  <span className="text-[8px]">ADD</span>
                </Link>
              )}
            </div>

            {/* ユーザー名ラベル */}
            <div className="mt-1 w-24 text-center">
                <p className="text-[10px] font-bold text-gray-700 truncate bg-white/90 px-2 py-0.5 rounded shadow-sm inline-block max-w-full">
                {user ? (user.name || "No Name") : "Empty"}
                </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}