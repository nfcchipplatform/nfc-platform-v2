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
}

// 形状データ（変更なし）
const NAIL_CONFIG = [
  { id: "thumb",  x: 54.06, y: 63.36, w: 7.7, h: 12.4, r: -124, br: "45% 45% 20% 20%" },
  { id: "index",  x: 56.27, y: 51.23, w: 7.6, h: 9.7,  r: 161,  br: "45% 45% 20% 20%" },
  { id: "middle", x: 44.79, y: 53.38, w: 8.0, h: 10.1, r: 164,  br: "45% 45% 20% 20%" },
  { id: "ring",   x: 33.76, y: 55.04, w: 7.7, h: 10.0, r: 167,  br: "45% 45% 20% 20%" },
  { id: "pinky",  x: 25.15, y: 54.71, w: 6.3, h: 9.0,  r: 159,  br: "45% 45% 20% 20%" },
];

export default function InteractiveHand({ slots }: InteractiveHandProps) {
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);

  useEffect(() => {
    const imagesToPreload = [
      "/handclose.png",
      "/handgoo.png",
      ...slots.filter(s => s?.image).map(s => s!.image as string)
    ];

    const preloadAll = async () => {
      const startTime = Date.now();
      const promises = imagesToPreload.map((src) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve;
        });
      });

      await Promise.all(promises);
      const delay = Math.max(0, 2000 - (Date.now() - startTime));

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
    <div 
      className="relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent"
      style={{
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      
      {/* 背景イラスト層 */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 bg-contain bg-center bg-no-repeat ${isAssetsReady ? "opacity-100" : "opacity-90"}`}
        style={{ 
          backgroundImage: `url(${getBgImage()})`,
        }}
        onPointerDown={() => {
          if (phase === "STANDBY") setPhase("PRESSED");
        }}
        onPointerUp={() => {
          if (phase === "PRESSED") setPhase("STANDBY");
        }}
        onPointerLeave={() => {
          if (phase === "PRESSED") setPhase("STANDBY");
        }}
      />

      {/* ネイル（スロット）層 - 構造をシンプル化 */}
      {NAIL_CONFIG.map((config, index) => {
        const user = slots[index];
        const isThumb = config.id === "thumb";
        const isVisible = phase !== "LOADING" && (!isThumb || phase === "PRESSED");

        // ユーザー画像がない場合は何も表示しない
        if (!user) return null;

        return (
          <Link
            key={config.id}
            href={`/${user.username}`}
            // Link自体にすべてのスタイルを集約
            className={`absolute block border-2 border-black overflow-hidden bg-cover bg-center group active:scale-95 transition-all duration-400 ease-out ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            }`}
            style={{
              // 位置、サイズ、回転
              left: `${config.x}%`,
              top: `${config.y}%`,
              width: `${config.w}%`,
              height: `${config.h}%`,
              transform: `translate(-50%, -50%) rotate(${config.r}deg)`,
              zIndex: isThumb ? 50 : 40,
              // 形状と画像
              borderRadius: config.br,
              backgroundImage: `url(${user.image})`,
              // スマホでの長押しメニュー防止
              WebkitTouchCallout: 'none', 
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* ホバー時の黒い膜（これだけは層として残すが、親の形に完全に追従する） */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </Link>
        );
      })}

      {/* ローディング演出 */}
      {phase === "LOADING" && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
        </div>
      )}
    </div>
  );
}