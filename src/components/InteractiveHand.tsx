"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NAIL_CONFIG, NailPoint } from "../constants/soulData";
import { useSoulAnimation } from "../hooks/useSoulAnimation";

interface ProfileSummary { id: string; username: string | null; name: string | null; image: string | null; }

export default function InteractiveHand({ slots }: { slots: (ProfileSummary | null)[] }) {
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  
  // フックからアニメーション状態を取得
  const { canvasRef, targetType, triggerExplosion, isExploding } = useSoulAnimation(phase);

  // 画像プリロード
  useEffect(() => {
    const images = ["/handclose.png", "/handgoo.png", "/handopen.png", ...slots.filter(s => s?.image).map(s => s!.image as string)];
    const preload = async () => {
      await Promise.all(images.map(src => new Promise<void>(res => {
        const img = new Image(); img.src = src; img.onload = () => res(); img.onerror = () => res();
      })));
      setTimeout(() => { setIsAssetsReady(true); setPhase("STANDBY"); }, 2000);
    };
    preload();
  }, [slots]);

  // 指を閉じる/開く処理の共通化
  const handlePointerDown = () => setPhase("PRESSED");
  const handlePointerUp = () => setPhase("STANDBY");

  return (
    <div className="relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent"
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}>
      
      {/* 1. 背景イラスト層 */}
      <div className={`absolute inset-0 transition-opacity duration-700 bg-contain bg-center bg-no-repeat ${isAssetsReady ? "opacity-100" : "opacity-90"}`}
        style={{ backgroundImage: `url(${phase === "PRESSED" ? "/handgoo.png" : phase === "LOADING" ? "/handopen.png" : "/handclose.png"})` }}
        onPointerDown={handlePointerDown} 
        onPointerUp={handlePointerUp} 
        onPointerLeave={handlePointerUp} 
      />

      {/* 2. 魂（もやもや）層: 背景と同じ操作イベントを追加 */}
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        onClick={triggerExplosion} // 形状の時に打ち上げる
        onPointerDown={handlePointerDown} // 魂を触った時も指を閉じる
        onPointerUp={handlePointerUp}    // 離した時に指を開く
        onPointerLeave={handlePointerUp} 
        className={`absolute pointer-events-auto transition-all duration-1000 ease-in-out ${
          isExploding ? "opacity-0 -translate-y-[200px] scale-[1.5]" : "opacity-80"
        } ${targetType === "BASE" ? "scale-[0.5]" : "scale-[0.67] cursor-pointer"}`} 
        style={{ 
          left: "45.59%", 
          top: "67.22%", 
          transform: `translate(-50%, -50%) ${targetType === "BASE" ? "scale(0.5)" : "scale(0.67)"}`,
          touchAction: "none" // スマホでのスクロール干渉を防止
        }} 
      />

      {/* 3. ネイルチップ層 */}
      {NAIL_CONFIG.map((config: NailPoint, index: number) => {
        const user = slots[index];
        const isVisible = phase !== "LOADING" && (config.id !== "thumb" || phase === "PRESSED");
        if (!user) return null;
        return (
          <Link key={config.id} href={`/${user.username}`}
            className={`absolute block border-2 border-black overflow-hidden bg-cover bg-center group active:scale-95 transition-all duration-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
            style={{ 
              left: `${config.x}%`, top: `${config.y}%`, width: `${config.w}%`, height: `${config.h}%`, 
              transform: `translate(-50%, -50%) rotate(${config.r}deg)`, 
              zIndex: config.id === "thumb" ? 50 : 40, 
              borderRadius: config.br, backgroundImage: `url(${user.image})`, WebkitTouchCallout: 'none' 
            }}
            onContextMenu={(e) => e.preventDefault()}>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}