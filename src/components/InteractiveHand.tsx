"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { NAIL_CONFIG, NailPoint } from "../constants/soulData";
import SoulCanvas, { SoulCanvasHandle } from "./SoulCanvas";
import { useHandInteraction } from "../hooks/useHandInteraction";
import { ImageDisplayConfig, DEFAULT_IMAGE_DISPLAY_CONFIG } from "../lib/soulImageDisplayAlgorithm";
import { getTheme } from "../lib/themeConfig";
import { withCloudinaryParams } from "../utils/imageLoader";
import { SoulImageConfig } from "../lib/soulImageConfig";

interface ProfileSummary { id: string; username: string | null; name: string | null; image: string | null; }

const ELEMENT_TAGS = ["Fire", "Wind", "Void", "Earth", "Water"];

export default function InteractiveHand({
  slots,
  themeId = "default",
  ownerImage = null,
}: {
  slots: (ProfileSummary | null)[];
  themeId?: string;
  ownerImage?: string | null;
}) {
  // 最初からLOADING状態でhandopenを表示（読み込みを待たない）
  const theme = useMemo(() => getTheme(themeId), [themeId]);
  const searchParams = useSearchParams();
  const auraAccentColor = theme.accentColor;
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const [isHandCloseReady, setIsHandCloseReady] = useState(false); // handcloseが読み込まれたかどうか
  const [currentSoulImage, setCurrentSoulImage] = useState<SoulImageConfig | null>(null);
  const soulCanvasRef = useRef<SoulCanvasHandle | null>(null);
  
  const equippedElementTags = useMemo(() => {
    // 4本指（人差し指〜小指）に装備されているエレメントのみを合算
    return slots
      .slice(1)
      .map((slot, index) => (slot ? ELEMENT_TAGS[index + 1] : null))
      .filter((tag): tag is string => Boolean(tag));
  }, [slots]);

  const ownerElementTag = ELEMENT_TAGS[0];

  // 画像表示設定（装備がなくてもオーナー属性画像を表示）
  const imageDisplayConfig: ImageDisplayConfig = useMemo(() => ({
    ...DEFAULT_IMAGE_DISPLAY_CONFIG,
    enabled: true,
  }), []);

  const handleAdvanceImage = useCallback(() => {
    soulCanvasRef.current?.advanceImage();
  }, []);

  const handleTriggerExplosion = useCallback(() => {
    soulCanvasRef.current?.triggerExplosion();
  }, []);

  const {
    phase,
    setPhase,
    soulOpacity,
    pressProgress,
    chargeFail,
    showLike,
    showResonance,
    likeBurst,
    likeLocked,
    likeConfirmedAt,
    handlePointerDown,
    handlePointerUp,
  } = useHandInteraction({
    currentSoulImage,
    onAdvanceImage: handleAdvanceImage,
    onLikeExplosion: handleTriggerExplosion,
  });
  const [nfcPulse, setNfcPulse] = useState(false);

  useEffect(() => {
    if (!searchParams) return;
    const entry = searchParams.get("entry");
    if (entry === "nfc") {
      setNfcPulse(true);
      const timeout = window.setTimeout(() => setNfcPulse(false), 700);
      return () => window.clearTimeout(timeout);
    }
  }, [searchParams]);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = "soulGuideDismissed";
    const dismissed = window.localStorage.getItem(key);
    setShowGuide(!dismissed);
  }, []);

  const handleGuideDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("soulGuideDismissed", "1");
    }
    setShowGuide(false);
  }, []);

  const handlePointerDownWithGuide = useCallback(() => {
    handleGuideDismiss();
    handlePointerDown();
  }, [handleGuideDismiss, handlePointerDown]);

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
          const optimizedSrc = src ? withCloudinaryParams(src) : src;
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
      
      // 5. ローディング完了（ネイル画像とhandcloseが確実に読み込まれた後に表示）
      setIsAssetsReady(true);
    };
    preload();
  }, [slots, nailCollectionImages]);

  useEffect(() => {
    if (isAssetsReady) {
      setPhase("STANDBY");
    }
  }, [isAssetsReady, setPhase]);
  
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
      const rawImage = config.id === "thumb" ? ownerImage : user?.image;
      // Retinaディスプレイ対応のため、幅400px + dpr_autoで高解像度を確保
      const optimizedImageUrl = rawImage ? withCloudinaryParams(rawImage) : rawImage;
      return { config, user, optimizedImageUrl };
    });
  }, [slots, ownerImage]);

  return (
    <div className={`relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent ${chargeFail ? "charge-fail" : ""}`}
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
        .charge-fail {
          animation: charge-fail 0.18s ease-in-out;
        }
        .guide-pulse {
          animation: guide-pulse 1.6s ease-in-out infinite;
        }
        .nfc-pulse {
          animation: nfc-pulse 0.7s ease-out both;
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
        @keyframes charge-fail {
          0% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          50% { transform: translateX(2px); }
          75% { transform: translateX(-1px); }
          100% { transform: translateX(0); }
        }
        @keyframes guide-pulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.08); opacity: 0.9; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes nfc-pulse {
          0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.25); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.6; }
        }
      `}</style>
      
      {/* 1. 背景イラスト層（handopenを最優先で即座に表示、ぼやけないように品質を確保） */}
      <div 
        className="absolute inset-0" 
        onPointerDown={handlePointerDownWithGuide} 
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
      <SoulCanvas
        ref={soulCanvasRef}
        phase={phase}
        isAssetsReady={isAssetsReady}
        imageDisplayConfig={imageDisplayConfig}
        filters={{ elementTags: equippedElementTags, ownerElementTag }}
        progress={pressProgress}
        auraColor={auraAccentColor}
        soulOpacity={soulOpacity}
        likeBurst={likeBurst}
        likeLocked={likeLocked}
        likeConfirmedAt={likeConfirmedAt}
        pauseSwitch={phase === "PRESSED" && pressProgress >= 0.5}
        onPointerDown={handlePointerDownWithGuide}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onImageChange={setCurrentSoulImage}
      />
      {nfcPulse && isAssetsReady && (
        <div
          className="absolute rounded-full border border-white/60 nfc-pulse pointer-events-none z-[130]"
          style={{
            left: phase === "PRESSED" ? "50%" : "45.59%",
            top: phase === "PRESSED" ? "32%" : "67.22%",
            width: "140px",
            height: "140px",
          }}
        />
      )}
      {phase === "PRESSED" && isAssetsReady && (
        <div
          className="absolute pointer-events-none z-[125]"
          style={{
            left: "45.59%",
            top: "67.22%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg width="120" height="120">
            <path
              d="M20 60 Q60 30 100 60 Q60 90 20 60"
              stroke="rgba(0,0,0,0.25)"
              strokeWidth="3"
              fill="none"
            />
            <path
              d="M20 60 Q60 30 100 60 Q60 90 20 60"
              stroke="rgba(0,0,0,0.9)"
              strokeWidth="3"
              fill="none"
              pathLength={100}
              strokeDasharray={`${Math.round(pressProgress * 100)} 100`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}
      {showGuide && isAssetsReady && (
        <div className="absolute inset-0 pointer-events-none z-[140]">
          <div
            className="absolute rounded-full border border-white/60 guide-pulse"
            style={{
              left: phase === "PRESSED" ? "50%" : "45.59%",
              top: phase === "PRESSED" ? "32%" : "67.22%",
              width: "120px",
              height: "120px",
              transform: "translate(-50%, -50%)",
            }}
          />
          <div
            className="absolute text-white/80 text-[10px] tracking-wide px-2 py-1 rounded-full bg-black/30"
            style={{
              left: "60%",
              top: "60%",
              transform: "translate(-50%, -50%)",
            }}
          >
            長押しで共鳴（Like）
          </div>
        </div>
      )}

      {showLike && (
        <div className="absolute inset-0 flex items-center justify-center z-[120] pointer-events-none">
          <div className="like-pop text-white text-3xl font-bold tracking-widest">LIKE</div>
        </div>
      )}
      {showResonance && (
        <div className="absolute inset-0 flex items-center justify-center z-[130] pointer-events-none">
          <div className="text-white text-lg font-black tracking-widest bg-black/40 px-4 py-2 rounded-full">
            RESONANCE COMPLETE
          </div>
        </div>
      )}

      {/* 3. ネイルチップ層（handcloseまたはhandgooが表示されてから表示） */}
      {nailConfigs.map(({ config, user, optimizedImageUrl }) => {
        const isThumb = config.id === "thumb";
        if (!isThumb && !user) return null;
        // handopen（LOADING）の時は表示しない
        // handgoo（PRESSED）の時：5本すべて表示
        // handclose（STANDBY）の時：handcloseが読み込まれた後に親指以外の4本のみ表示
        const isVisible = phase === "LOADING" 
          ? false // handopenの時は表示しない
          : phase === "PRESSED"
            ? (isThumb ? Boolean(ownerImage) : false) // handgooの時は親指のみ表示
            : phase === "STANDBY" && isHandCloseReady && config.id !== "thumb" && Boolean(user); // handcloseは親指なし＆装備者のみ
        
        const commonProps = {
          className: `absolute block border-2 border-black overflow-hidden group active:scale-95 transition-all duration-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`,
          style: {
            left: `${config.x}%`,
            top: `${config.y}%`,
            width: `${config.w}%`,
            height: `${config.h}%`,
            transform: `translate(-50%, -50%) rotate(${config.r}deg)`,
            zIndex: phase === "PRESSED" ? 50 : 110, // handgooの時は後ろに、handcloseの時は前に配置してクリック可能にする
            borderRadius: config.br,
            WebkitTouchCallout: "none",
          } as React.CSSProperties,
        };

        if (isThumb) {
          return (
            <div key={config.id} {...commonProps}>
              {optimizedImageUrl && (
                <Image
                  src={optimizedImageUrl}
                  alt="Owner nail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 450px) 8vw, 8vw"
                  loading="lazy"
                />
              )}
            </div>
          );
        }

        return (
          <Link key={config.id} href={`/${user?.username ?? ""}`}
            {...commonProps}
            onContextMenu={(e) => e.preventDefault()}>
            {optimizedImageUrl && (
              <Image
                src={optimizedImageUrl}
                alt={user?.name || ""}
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