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

// 頂いた座標・角度データを定義
const NAIL_CONFIG = [
  { id: "thumb",  label: "親指", x: 54.06, y: 63.36, deg: -124 },
  { id: "index",  label: "人差", x: 56.27, y: 51.23, deg: 161 },
  { id: "middle", label: "中指", x: 44.79, y: 53.38, deg: 167 },
  { id: "ring",   label: "薬指", x: 33.76, y: 55.04, deg: 167 },
  { id: "pinky",  label: "小指", x: 25.15, y: 54.71, deg: 159 },
];

export default function InteractiveHand({ slots, profileImage }: InteractiveHandProps) {
  const [phase, setPhase] = useState<"OPEN" | "STANDBY" | "PRESSED">("OPEN");

  // 1. 初回マウント後、2秒で自動的にスタンバイ状態へ
  useEffect(() => {
    const timer = setTimeout(() => setPhase("STANDBY"), 2000);
    return () => clearTimeout(timer);
  }, []);

  // フェーズに応じた背景画像
  const getBgImage = () => {
    if (phase === "OPEN") return "/handopen.png";
    if (phase === "PRESSED") return "/handgoo.png";
    return "/handclose.png";
  };

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-[3/4] select-none touch-none">
      
      {/* 背景イラスト層 */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        onPointerDown={() => phase !== "OPEN" && setPhase("PRESSED")}
        onPointerUp={() => phase !== "OPEN" && setPhase("STANDBY")}
        onPointerLeave={() => phase !== "OPEN" && setPhase("STANDBY")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={getBgImage()} 
          alt="Interactive Hand" 
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* ネイル（スロット）層 */}
      {NAIL_CONFIG.map((config, index) => {
        const user = slots[index];
        const isThumb = config.id === "thumb";
        
        // 表示判定
        // OPENフェーズは一切表示しない
        // STANDBYフェーズは親指以外を表示
        // PRESSEDフェーズは全部表示
        const isVisible = phase !== "OPEN" && (!isThumb || phase === "PRESSED");

        return (
          <div
            key={config.id}
            className={`absolute transition-all duration-300 ease-out ${
              isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
            }`}
            style={{
              left: `${config.x}%`,
              top: `${config.y}%`,
              width: "12%", // 画像のサイズに合わせて微調整
              height: "16%",
              transform: `translate(-50%, -50%) rotate(${config.deg}deg)`,
              zIndex: isThumb ? 50 : 40, // 親指を一番上に
            }}
          >
            {user ? (
              <Link href={`/${user.username}`} className="block w-full h-full group">
                <div 
                  className="w-full h-full rounded-[45%_45%_20%_20%] border-2 border-white/50 shadow-lg overflow-hidden bg-gray-200"
                  style={{ backgroundImage: `url(${user.image || '/noimage.png'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                </div>
              </Link>
            ) : (
              <div className="w-full h-full rounded-[45%_45%_20%_20%] border-2 border-dashed border-gray-400/50 bg-gray-100/30 flex items-center justify-center">
                <span className="text-[10px] text-gray-400">?</span>
              </div>
            )}
          </div>
        );
      })}

      {/* 中央のプロフィール（オプション: 必要に応じて配置） */}
      {/* 以前のように中央に自分の顔を出したい場合はここに追加できます */}
    </div>
  );
}