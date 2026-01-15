"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  const [isHandCloseReady, setIsHandCloseReady] = useState(false); // handcloseが読み込まれたかどうか
  const [pressedStartTime, setPressedStartTime] = useState<number | null>(null);
  const [soulOpacity, setSoulOpacity] = useState(0.8);
  
  // 画像表示設定（デフォルトで有効、画像が無い場合はフォールバック画像を表示）
  const imageDisplayConfig: ImageDisplayConfig = useMemo(() => ({
    ...DEFAULT_IMAGE_DISPLAY_CONFIG,
    enabled: true, // 画像表示を有効にする
  }), []);

  const likeTimeoutRef = useRef<number | null>(null);
  const likedThisPressRef = useRef(false);
  const [showLike, setShowLike] = useState(false);
  const [likeBurst, setLikeBurst] = useState(false);

  // フックからアニメーション状態を取得（画像表示機能付き）
  const { canvasRef, targetType, triggerExplosion, isExploding, currentSoulImage, advanceImage } = useSoulAnimationWithImage(
    phase,
    imageDisplayConfig,
    { forceShape: likeBurst ? "HEART" : undefined, burst: likeBurst }
  );

  // ネイルコレクション（5本すべて）の画像を特定
  const nailCollectionImages = useMemo(() => {
    return slots
      .filter(s => s?.image)
      .map(s => s!.image as string);
  }, [slots]);

  // バックグラウンドで画像をプリロード（handopenは既に表示されているので待たない）
  useEffect(() => {
    // handopenの表示開始時刻を記録（最低1秒表示するため）
    const startTime = Date.now();
    const MIN_DISPLAY_TIME = 1000; // 1秒
    
    const preload = async () => {
      // 1. ネイルコレクション（5本すべて）の画像を先に読み込む
      await Promise.all(nailCollectionImages.map((src): Promise<void> => {
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
      
      // 2. handcloseを確実に読み込む（handcloseが表示される前に読み込み完了を確認）
      await new Promise<void>((resolve) => {
        const img = document.createElement('img');
        img.src = "/handclose.png";
        img.onload = () => {
          setIsHandCloseReady(true); // handcloseが読み込まれたことを記録
          resolve();
        };
        img.onerror = () => {
          setIsHandCloseReady(true); // エラーでも続行
          resolve();
        };
      });
      
      // 3. handgooを読み込み（handcloseの後に読み込む）
      await new Promise<void>((resolve) => {
        const img = document.createElement('img');
        img.src = "/handgoo.png";
        img.onload = () => resolve();
        img.onerror = () => resolve(); // エラーでも続行
      });
      
      // 4. 全ての重要な画像が読み込まれたら、最低1秒経過するまで待つ
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DISPLAY_TIME - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      // 5. ローディング完了（ネイル画像とhandcloseが確実に読み込まれた後にSTANDBYに移行）
      setIsAssetsReady(true);
      setPhase("STANDBY");
    };
    preload();
  }, [slots, nailCollectionImages]);

  // 指を閉じる/開く処理の共通化（メモ化で再レンダリングを防止）
  const handlePointerDown = useCallback(() => {
    setPhase("PRESSED");
    setPressedStartTime(Date.now());
    likedThisPressRef.current = false;
  }, []);
  const handlePointerUp = useCallback(() => {
    setPhase("STANDBY");
    setPressedStartTime(null);
    setSoulOpacity(0.8);
    const shouldAdvance = !likedThisPressRef.current;
    likedThisPressRef.current = false;
    if (likeTimeoutRef.current) {
      window.clearTimeout(likeTimeoutRef.current);
      likeTimeoutRef.current = null;
    }
    // LIKEされなかった場合はすぐ次の画像へ
    if (shouldAdvance) {
      advanceImage();
    }
  }, []);

  // handgooを5秒保持したらLIKEを記録（過去20件のみ保持）
  useEffect(() => {
    if (phase !== "PRESSED" || !currentSoulImage || likedThisPressRef.current) return;
    if (likeTimeoutRef.current) {
      window.clearTimeout(likeTimeoutRef.current);
    }

    likeTimeoutRef.current = window.setTimeout(() => {
      if (likedThisPressRef.current || phase !== "PRESSED") return;
      likedThisPressRef.current = true;

      if (typeof window === "undefined") return;
      const key = "soulLikeHistory";
      const existingRaw = window.localStorage.getItem(key);
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      const nextEntry = {
        id: currentSoulImage.id,
        path: currentSoulImage.path,
        tags: currentSoulImage.tags ?? [],
        likedAt: new Date().toISOString(),
      };
      const updated = [nextEntry, ...existing].slice(0, 20);
      window.localStorage.setItem(key, JSON.stringify(updated));

      // LIKE演出
      setShowLike(true);
      setLikeBurst(true);
      window.setTimeout(() => setShowLike(false), 1200);
      window.setTimeout(() => setLikeBurst(false), 900);

      // handcloseに戻して次の未表示画像を表示
      setPhase("STANDBY");
      setPressedStartTime(null);
      setSoulOpacity(0.8);
      advanceImage();
    }, 5000);

    return () => {
      if (likeTimeoutRef.current) {
        window.clearTimeout(likeTimeoutRef.current);
        likeTimeoutRef.current = null;
      }
    };
  }, [phase, currentSoulImage]);

  // 押し続けている時間に応じて魂の不透明度を調整（0.6秒かけて）
  useEffect(() => {
    if (phase !== "PRESSED" || pressedStartTime === null) return;

    const FADE_DURATION = 600; // 0.6秒
    const interval = setInterval(() => {
      const elapsed = Date.now() - pressedStartTime;
      const progress = Math.min(elapsed / FADE_DURATION, 1.0);
      
      // 魂の不透明度を0.8から1.0に上げる（handの上に濃い魂が重なる）
      setSoulOpacity(0.8 + (0.2 * progress));
    }, 16); // 約60fps

    return () => clearInterval(interval);
  }, [phase, pressedStartTime]);
  
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
      <style jsx>{`
        .soul-burst {
          animation: soul-burst 0.9s ease-out both;
        }
        .like-pop {
          animation: like-pop 1.2s ease-out both;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.4);
          opacity: 0.5;
        }
        @keyframes soul-burst {
          0% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; filter: drop-shadow(0 0 6px rgba(255,255,255,0.4)); }
          70% { transform: translate(-50%, -50%) scale(1.6) rotate(8deg); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2.0) rotate(15deg); opacity: 0; }
        }
        @keyframes like-pop {
          0% { transform: scale(0.8); opacity: 0; }
          20% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
      
      {/* 1. 背景イラスト層（handopenを最優先で即座に表示、ぼやけないように品質を確保） */}
      <div 
        className="absolute inset-0" 
        onPointerDown={handlePointerDown} 
        onPointerUp={handlePointerUp} 
        onPointerLeave={handlePointerUp}
        style={{ 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        <Image
          src={handImageSrc}
          alt="Hand illustration"
          fill
          className="object-contain opacity-100"
          priority
          quality={100}
          sizes="(max-width: 450px) 100vw, 450px"
          draggable={false}
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
            isExploding ? "opacity-0 -translate-y-[200px] scale-[1.5]" : ""
          } ${likeBurst ? "soul-burst" : ""} ${phase === "PRESSED" ? "scale-[1.2]" : targetType === "BASE" ? "scale-[0.5]" : "scale-[0.67] cursor-pointer"}`}
          style={{ 
            left: phase === "PRESSED" ? "50%" : "45.59%", 
            top: phase === "PRESSED" ? "32%" : "67.22%", 
            transform: `translate(-50%, -50%) ${
              phase === "PRESSED" 
                ? "scale(1.2)" 
                : targetType === "BASE" 
                  ? "scale(0.5)" 
                  : "scale(0.67)"
            }`,
            touchAction: "none",
            opacity: isExploding ? 0 : soulOpacity,
            zIndex: phase === "PRESSED" ? 100 : 50 // handgooの時だけ魂を前に、handcloseの時は後ろに
          }} 
        />
      )}

      {showLike && (
        <div className="absolute inset-0 flex items-center justify-center z-[120] pointer-events-none">
          <div className="like-pop text-white text-3xl font-bold tracking-widest">LIKE</div>
        </div>
      )}

      {/* 3. ネイルチップ層（handcloseまたはhandgooが表示されてから表示） */}
      {nailConfigs.map(({ config, user, optimizedImageUrl }) => {
        if (!user) return null;
        // handopen（LOADING）の時は表示しない
        // handgoo（PRESSED）の時：5本すべて表示
        // handclose（STANDBY）の時：handcloseが読み込まれた後に親指以外の4本のみ表示
        const isVisible = phase === "LOADING" 
          ? false // handopenの時は表示しない
          : phase === "PRESSED" 
            ? true // handgooの時は5本すべて表示
            : phase === "STANDBY" && isHandCloseReady && config.id !== "thumb"; // handcloseが読み込まれた後に親指以外の4本のみ表示
        
        return (
          <Link key={config.id} href={`/${user.username}`}
            className={`absolute block border-2 border-black overflow-hidden group active:scale-95 transition-all duration-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
            style={{ 
              left: `${config.x}%`, top: `${config.y}%`, width: `${config.w}%`, height: `${config.h}%`, 
              transform: `translate(-50%, -50%) rotate(${config.r}deg)`, 
              zIndex: phase === "PRESSED" ? 50 : 110, // handgooの時は後ろに、handcloseの時は前に配置してクリック可能にする
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