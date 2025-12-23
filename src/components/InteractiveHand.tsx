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

// ユーザーから提供された座標・角度データ
const NAIL_CONFIG = [
  { id: "thumb",  x: 54.06, y: 63.36, deg: -124 },
  { id: "index",  x: 56.27, y: 51.23, deg: 161 },
  { id: "middle", x: 44.79, y: 53.38, deg: 167 },
  { id: "ring",   x: 33.76, y: 55.04, deg: 167 },
  { id: "pinky",  x: 25.15, y: 54.71, deg: 159 },
];

export default function InteractiveHand({ slots }: InteractiveHandProps) {
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);

  useEffect(() => {
    // プリロード対象のリスト
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
          img.onerror = resolve; // エラー時も停止させない
        });
      });

      await Promise.all(promises);
      
      // 最低2秒間の演出時間を確保
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
    <div 
      className="relative w-full overflow-hidden aspect-[3/4] select-none touch-none bg-transparent"
      style={{
        // スマホでの長押しメニューと選択を徹底的に無効化
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      // 右クリック（長押し）メニューを無効化
      onContextMenu={(e) => e.preventDefault()}
    >
      
      {/* 背景イラスト層: imgタグではなく背景画像として扱うことで選択を防止 */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 bg-contain bg-center bg-no-repeat ${isAssetsReady ? "opacity-100" : "opacity-90"}`}
        style={{ 
          backgroundImage: `url(${getBgImage()})`,
          WebkitTouchCallout: 'none'
        }}
        onPointerDown={(e) => {
          // デフォルトのブラウザ挙動を抑制
          if (phase === "STANDBY") setPhase("PRESSED");
        }}
        onPointerUp={() => {
          if (phase === "PRESSED") setPhase("STANDBY");
        }}
        onPointerLeave={() => {
          if (phase === "PRESSED") setPhase("STANDBY");
        }}
      />

      {/* ネイル（スロット）層 */}
      {NAIL_CONFIG.map((config, index) => {
        const user = slots[index];
        const isThumb = config.id === "thumb";
        
        // OPENフェーズは表示しない / STANDBYは親指以外 / PRESSEDは全部
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
              width: "12.5%", // 爪の横幅を微調整
              height: "16.5%", // 爪の縦幅を微調整
              transform: `translate(-50%, -50%) rotate(${config.deg}deg)`,
              zIndex: isThumb ? 50 : 40,
              WebkitTouchCallout: 'none',
            }}
          >
            {user && (
              <Link 
                href={`/${user.username}`} 
                className="block w-full h-full group active:scale-95 transition-transform"
                onContextMenu={(e) => e.preventDefault()} // リンクの長押しメニューも防止
              >
                <div 
                  className="w-full h-full rounded-[45%_45%_20%_20%] border-2 border-white shadow-md overflow-hidden bg-gray-200"
                  style={{ 
                    backgroundImage: `url(${user.image})`, 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center' 
                  }}
                >
                  {/* ホバー/タップ時のオーバーレイ */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>
              </Link>
            )}
          </div>
        );
      })}

      {/* ローディング演出 (handopen表示中のみ) */}
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