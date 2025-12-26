"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAIL_CONFIG, NailPoint } from "../constants/soulData";
import { useSoulAnimationWithImage } from "../hooks/useSoulAnimationWithImage";
import { ImageDisplayConfig, DEFAULT_IMAGE_DISPLAY_CONFIG } from "../lib/soulImageDisplayAlgorithm";

interface ProfileSummary { id: string; username: string | null; name: string | null; image: string | null; }

export default function InteractiveHand({ slots }: { slots: (ProfileSummary | null)[] }) {
  // 最初からLOADING状態でhandopenを表示（読み込みを待たない）
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  
  // 画像表示設定（デフォルトで有効、画像が無い場合はフォールバック画像を表示）
  const imageDisplayConfig: ImageDisplayConfig = useMemo(() => ({
    ...DEFAULT_IMAGE_DISPLAY_CONFIG,
    enabled: true, // 画像表示を有効にする
  }), []);

  // フックからアニメーション状態を取得（画像表示機能付き）
  const { canvasRef, targetType, triggerExplosion, isExploding } = useSoulAnimationWithImage(phase, imageDisplayConfig);

  // handopenの時に表示されるマイフィンガーの画像を特定（親指以外の4本の指）
  const myFingerImages = useMemo(() => {
    return slots
      .slice(1) // 親指（index 0）を除外
      .filter(s => s?.image)
      .map(s => s!.image as string);
  }, [slots]);

  // バックグラウンドで画像をプリロード（handopenは既に表示されているので待たない）
  useEffect(() => {
    // handopenの表示開始時刻を記録（最低1秒表示するため）
    const startTime = Date.now();
    const MIN_DISPLAY_TIME = 1000; // 1秒
    
    // 手の画像（handgooとhandcloseのみ、handopenは既に表示中）
    const handImages = ["/handgoo.png", "/handclose.png"];
    
    // handopenの時に表示されるマイフィンガーの画像（必須）
    // 親指以外の4本の指の画像を確実に読み込む
    const criticalProfileImages = myFingerImages;
    
    // その他のプロフィール画像（親指など、後で表示されるもの）
    const otherProfileImages = slots
      .filter((s, idx) => idx === 0 && s?.image) // 親指のみ
      .map(s => s!.image as string);
    
    const preload = async () => {
      // 1. handgooとhandcloseを読み込み（handopenは既に表示中なので待たない）
      await Promise.all(handImages.map((src): Promise<void> => {
        return new Promise((resolve) => {
          const img = document.createElement('img');
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => resolve(); // エラーでも続行
        });
      }));
      
      // 2. handopenの時に表示されるマイフィンガーの画像を読み込み
      await Promise.all(criticalProfileImages.map((src): Promise<void> => {
        return new Promise((resolve) => {
          const img = document.createElement('img');
          // Cloudinary最適化パラメータを追加（高解像度対応）
          const optimizedSrc = src?.startsWith('http') 
            ? `${src}?f_auto,q_auto,w_400,dpr_auto` 
            : src;
          img.src = optimizedSrc;
          img.onload = () => resolve();
          img.onerror = () => resolve(); // エラーでも続行
        });
      }));
      
      // 3. 全ての重要な画像が読み込まれたら、最低1秒経過するまで待つ
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // 4. ローディング完了
      setIsAssetsReady(true);
      setPhase("STANDBY");
      
      // 5. その他のプロフィール画像はバックグラウンドで読み込み（ブロックしない）
      otherProfileImages.forEach(src => {
        const img = document.createElement('img');
        const optimizedSrc = src?.startsWith('http') 
          ? `${src}?f_auto,q_auto,w_400,dpr_auto` 
          : src;
        img.src = optimizedSrc;
      });
    };
    preload();
  }, [slots, myFingerImages]);

  // 指を閉じる/開く処理の共通化（メモ化で再レンダリングを防止）
  const handlePointerDown = useCallback(() => setPhase("PRESSED"), []);
  const handlePointerUp = useCallback(() => setPhase("STANDBY"), []);
  
  // 手の画像URLをメモ化
  const handImageSrc = useMemo(() => {
    if (phase === "PRESSED") return "/handgoo.png";
    if (phase === "LOADING") return "/handopen.png";
    return "/handclose.png";
  }, [phase]);
  
  // ネイルチップの最適化されたURLをメモ化（高解像度対応）
  const nailConfigs = useMemo(() => {
    return NAIL_CONFIG.map((config, index) => {
      const user = slots[index];
      // Retinaディスプレイ対応のため、幅400px + dpr_autoで高解像度を確保
      const optimizedImageUrl = user?.image?.startsWith('http') 
        ? `${user.image}?f_auto,q_auto,w_400,dpr_auto` 
        : user?.image;
      return { config, user, optimizedImageUrl };
    });
  }, [slots]);

  return (
    <div className="relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent"
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}>
      
      {/* 1. 背景イラスト層（handopenを最優先で即座に表示、ぼやけないように品質を確保） */}
      <div className="absolute inset-0" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
        <Image
          src={handImageSrc}
          alt="Hand illustration"
          fill
          className="object-contain opacity-100"
          priority
          quality={100}
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

      {/* 3. ネイルチップ層（handcloseまたはhandgooが表示されてから表示） */}
      {nailConfigs.map(({ config, user, optimizedImageUrl }) => {
        if (!user) return null;
        // handopen（LOADING）の時は表示しない
        // handgoo（PRESSED）の時：5本すべて表示、handclose（STANDBY）の時：親指以外の4本のみ表示
        const isVisible = phase === "LOADING" 
          ? false // handopenの時は表示しない
          : phase === "PRESSED" 
            ? true // handgooの時は5本すべて表示
            : phase === "STANDBY" && config.id !== "thumb"; // handcloseの時は親指以外の4本のみ表示
        
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