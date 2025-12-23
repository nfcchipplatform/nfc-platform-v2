"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ProfileSummary {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

interface InteractiveHandProps {
  slots: (ProfileSummary | null)[];
  profileImage?: string | null;
}

const NAIL_CONFIG = [
  { id: "thumb",  x: 54.06, y: 63.36, deg: -124 },
  { id: "index",  x: 56.27, y: 51.23, deg: 161 },
  { id: "middle", x: 44.79, y: 53.38, deg: 167 },
  { id: "ring",   x: 33.76, y: 55.04, deg: 167 },
  { id: "pinky",  x: 25.15, y: 54.71, deg: 159 },
];

export default function InteractiveHand({ slots }: InteractiveHandProps) {
  // 状態管理を LOADING から開始
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);

  useEffect(() => {
    // 1. プリロード対象の画像リストを作成
    const imagesToPreload = [
      "/handclose.png",
      "/handgoo.png",
      // スロットにあるユーザーの画像URLを追加（null以外）
      ...slots.filter(s => s?.image).map(s => s!.image as string)
    ];

    const preloadAll = async () => {
      const startTime = Date.now();

      // 画像読み込みプロミスの作成
      const promises = imagesToPreload.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // エラー時も進行を止めない
        });
      });

      // すべての画像読み込み完了を待つ
      await Promise.all(promises);

      // 最低限の演出時間（2秒）を確保するための計算
      const elapsedTime = Date.now() - startTime;
      const delay = Math.max(0, 2000 - elapsedTime);

      setTimeout(() => {
        setIsAssetsReady(true);
        setPhase("STANDBY");
      }, delay);
    };

    preloadAll();
  }, [slots]);

  const getBgImage = () => {
    if (phase === "LOADING") return "/handopen.png";
    if (phase === "PRESSED") return "/handgoo.png";
    return "/handclose.png";
  };

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-[3/4] select-none touch-none">
      
      {/* 背景イラスト層 */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 ${isAssetsReady ? "opacity-100" : "opacity-90"}`}
        onPointerDown={() => phase === "STANDBY" && setPhase("PRESSED")}
        onPointerUp={() => phase === "PRESSED" && setPhase("STANDBY")}
        onPointerLeave={() => phase === "PRESSED" && setPhase("STANDBY")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={getBgImage()} 
          alt="Interactive Hand" 
          className="w-full h-full object-contain pointer-events-none"
        />
        
        {/* ローディング中のインジケーター（任意：handopenの上に薄く出すなど） */}
        {phase === "LOADING" && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* ネイル（スロット）層 */}
      {NAIL_CONFIG.map((config, index) => {
        const user = slots[index];
        const isThumb = config.id === "thumb";
        
        // 読み込み完了後、かつフェーズに合わせた表示
        const isVisible = phase !== "LOADING" && (!isThumb || phase === "PRESSED");

        return (
          <div
            key={config.id}
            className={`absolute transition-all duration-400 ease-out ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
            style={{
              left: `${config.x}%`,
              top: `${config.y}%`,
              width: "12%",
              height: "16%",
              transform: `translate(-50%, -50%) rotate(${config.deg}deg)`,
              zIndex: isThumb ? 50 : 40,
            }}
          >
            {user && (
              <Link href={`/${user.username}`} className="block w-full h-full group">
                <div 
                  className="w-full h-full rounded-[45%_45%_20%_20%] border-2 border-white shadow-md overflow-hidden bg-gray-200"
                  style={{ backgroundImage: `url(${user.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}