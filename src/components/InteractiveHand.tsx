"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAIL_CONFIG, NailPoint } from "../constants/soulData";
import { useSoulAnimation } from "../hooks/useSoulAnimation";

interface ProfileSummary { id: string; username: string | null; name: string | null; image: string | null; }

export default function InteractiveHand({ slots }: { slots: (ProfileSummary | null)[] }) {
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  
  // フックからアニメーション状態を取得
  const { canvasRef, targetType, triggerExplosion, isExploding } = useSoulAnimation(phase);

  // 画像プリロード（2秒ウェイトを削除、即時表示に変更）
  useEffect(() => {
    const images = ["/handclose.png", "/handgoo.png", "/handopen.png", ...slots.filter(s => s?.image).map(s => s!.image as string)];
    let loadedCount = 0;
    const totalImages = images.length;
    
    // 重要な画像（手の画像）を優先読み込み
    const criticalImages = images.slice(0, 3);
    const profileImages = images.slice(3);
    
    const preload = async () => {
      // 重要な画像を先に読み込み
      await Promise.all(criticalImages.map((src): Promise<void> => {
        return new Promise((resolve) => {
          const img = document.createElement('img');
          img.src = src;
          img.onload = () => { loadedCount++; resolve(); };
          img.onerror = () => { loadedCount++; resolve(); };
        });
      }));
      
      // 重要な画像が読み込まれたら即座に表示開始
      setIsAssetsReady(true);
      setPhase("STANDBY");
      
      // プロフィール画像はバックグラウンドで読み込み（ブロックしない）
      profileImages.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.onload = () => { loadedCount++; };
        img.onerror = () => { loadedCount++; };
      });
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
      
      {/* 1. 背景イラスト層（next/imageで最適化） */}
      <div className="absolute inset-0" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        <Image
          src={phase === "PRESSED" ? "/handgoo.png" : phase === "LOADING" ? "/handopen.png" : "/handclose.png"}
          alt="Hand illustration"
          fill
          className={`object-contain transition-opacity duration-700 ${isAssetsReady ? "opacity-100" : "opacity-90"}`}
          priority
          sizes="(max-width: 450px) 100vw, 450px"
        />
      </div>

      {/* 2. 魂（もやもや）層: 背景と同じ操作イベントを追加（アセット読み込み後に表示） */}
      {isAssetsReady && (
        <canvas 
          ref={canvasRef} 
          width={400} 
          height={400} 
          onClick={triggerExplosion}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp} 
          className={`absolute pointer-events-auto transition-all duration-1000 ease-in-out ${
            isExploding ? "opacity-0 -translate-y-[200px] scale-[1.5]" : "opacity-80"
          } ${targetType === "BASE" ? "scale-[0.5]" : "scale-[0.67] cursor-pointer"}`} 
          style={{ 
            left: "45.59%", 
            top: "67.22%", 
            transform: `translate(-50%, -50%) ${targetType === "BASE" ? "scale(0.5)" : "scale(0.67)"}`,
            touchAction: "none"
          }} 
        />
      )}

      {/* 3. ネイルチップ層 */}
      {NAIL_CONFIG.map((config: NailPoint, index: number) => {
        const user = slots[index];
        const isVisible = phase !== "LOADING" && (config.id !== "thumb" || phase === "PRESSED");
        if (!user) return null;
        // Cloudinary最適化: 画像URLに最適化パラメータを追加
        const optimizedImageUrl = user.image?.startsWith('http') 
          ? `${user.image}?f_auto,q_auto,w_200` 
          : user.image;
        
        return (
          <Link key={config.id} href={`/${user.username}`}
            className={`absolute block border-2 border-black overflow-hidden group active:scale-95 transition-all duration-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
            style={{ 
              left: `${config.x}%`, top: `${config.y}%`, width: `${config.w}%`, height: `${config.h}%`, 
              transform: `translate(-50%, -50%) rotate(${config.r}deg)`, 
              zIndex: config.id === "thumb" ? 50 : 40, 
              borderRadius: config.br,
              WebkitTouchCallout: 'none' 
            }}
            onContextMenu={(e) => e.preventDefault()}>
            {optimizedImageUrl && (
              <Image
                src={optimizedImageUrl}
                alt={user.name || ""}
                fill
                className="object-cover"
                sizes="(max-width: 450px) 8vw, 8vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}