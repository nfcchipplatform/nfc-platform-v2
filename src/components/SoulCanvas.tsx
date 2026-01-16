// src/components/SoulCanvas.tsx
"use client";

import { forwardRef, memo, useEffect, useMemo, useRef, useState, useImperativeHandle } from "react";
import { ImageDisplayConfig } from "../lib/soulImageDisplayAlgorithm";
import { SoulImageConfig, SoulImageFilter } from "../lib/soulImageConfig";
import { useSoulAnimationWithImage } from "../hooks/useSoulAnimationWithImage";

export type SoulCanvasHandle = {
  advanceImage: () => void;
  triggerExplosion: () => void;
};

type SoulCanvasProps = {
  phase: "LOADING" | "STANDBY" | "PRESSED";
  isAssetsReady: boolean;
  imageDisplayConfig: ImageDisplayConfig;
  filters: SoulImageFilter;
  progress: number;
  auraColor: string;
  soulOpacity: number;
  likeBurst: boolean;
  likeLocked: boolean;
  likeConfirmedAt: number | null;
  pauseSwitch: boolean;
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onImageChange?: (image: SoulImageConfig | null) => void;
};

const SoulCanvas = memo(
  forwardRef<SoulCanvasHandle, SoulCanvasProps>(
    (
      {
        phase,
        isAssetsReady,
        imageDisplayConfig,
        filters,
        progress,
        auraColor,
        soulOpacity,
        likeBurst,
        likeLocked,
        likeConfirmedAt,
        onPointerDown,
        onPointerUp,
        onPointerLeave,
        onImageChange,
        pauseSwitch,
      },
      ref
    ) => {
      const [overlayImages, setOverlayImages] = useState<HTMLImageElement[]>([]);
      const [flashAlpha, setFlashAlpha] = useState(0);
      const overlayLoadIdRef = useRef(0);

      const [canvasSize, setCanvasSize] = useState(400);
      const {
        canvasRef,
        targetType,
        triggerExplosion,
        isExploding,
        currentSoulImage,
        advanceImage,
      } = useSoulAnimationWithImage(
        phase,
        imageDisplayConfig,
        { burst: likeBurst },
        filters,
        progress,
        auraColor,
        overlayImages,
        0.1,
        flashAlpha,
        likeLocked,
        pauseSwitch
      );

      useImperativeHandle(ref, () => ({ advanceImage, triggerExplosion }), [advanceImage, triggerExplosion]);

      useEffect(() => {
        onImageChange?.(currentSoulImage);
      }, [currentSoulImage, onImageChange]);

      useEffect(() => {
        if (!likeConfirmedAt) return;
        setFlashAlpha(1);
        const timeout = window.setTimeout(() => setFlashAlpha(0), 200);
        return () => window.clearTimeout(timeout);
      }, [likeConfirmedAt]);

      useEffect(() => {
        const canvas = canvasRef.current;
        const parent = canvas?.parentElement;
        if (!canvas || !parent) return;

        const updateSize = () => {
          const rect = parent.getBoundingClientRect();
          const size = Math.max(240, Math.round(Math.min(rect.width, rect.height)));
          setCanvasSize(size);
        };

        updateSize();
        const observer = new ResizeObserver(updateSize);
        observer.observe(parent);
        return () => observer.disconnect();
      }, [canvasRef]);

      const likedPaths = useMemo(() => {
        if (typeof window === "undefined") return [];
        try {
          const raw = window.localStorage.getItem("soulLikeHistory");
          const parsed = (raw ? JSON.parse(raw) : []) as Array<{ path?: unknown }>;
          return parsed
            .map((entry) => (typeof entry?.path === "string" ? entry.path : null))
            .filter((path): path is string => Boolean(path));
        } catch {
          return [];
        }
      }, [currentSoulImage?.id]);

      useEffect(() => {
        if (likedPaths.length === 0) {
          setOverlayImages([]);
          return;
        }
        const loadId = overlayLoadIdRef.current + 1;
        overlayLoadIdRef.current = loadId;

        const unique = Array.from(new Set(likedPaths));
        const count = Math.min(unique.length, Math.random() < 0.5 ? 1 : 2);
        const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, count);

        const loaders = shuffled.map(
          (path) =>
            new Promise<HTMLImageElement>((resolve) => {
              const img = new window.Image();
              img.crossOrigin = "anonymous";
              img.onload = () => resolve(img);
              img.onerror = () => resolve(img);
              img.src = path;
            })
        );

        Promise.all(loaders).then((images) => {
          if (overlayLoadIdRef.current !== loadId) return;
          setOverlayImages(images);
        });
      }, [likedPaths]);

      if (!isAssetsReady) return null;

      return (
        <canvas
          ref={canvasRef}
          width={canvasSize}
          height={canvasSize}
          onClick={triggerExplosion}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerLeave}
          className={`absolute pointer-events-auto transition-all duration-1000 ease-in-out ${
            isExploding ? "opacity-0 -translate-y-[200px] scale-[1.5]" : ""
          } ${likeBurst ? "soul-burst" : ""} ${
            phase === "PRESSED" ? "scale-[1.2]" : targetType === "BASE" ? "scale-[0.5]" : "scale-[0.67] cursor-pointer"
          }`}
          style={{
            left: phase === "PRESSED" ? "50%" : "45.59%",
            top: phase === "PRESSED" ? "32%" : "67.22%",
            transform: `translate(-50%, -50%) ${
              phase === "PRESSED" ? "scale(1.2)" : targetType === "BASE" ? "scale(0.5)" : "scale(0.67)"
            }`,
            touchAction: "none",
            opacity: isExploding ? 0 : soulOpacity,
            zIndex: phase === "PRESSED" ? 100 : 50,
            width: `${canvasSize}px`,
            height: `${canvasSize}px`,
          }}
        />
      );
    }
  )
);

SoulCanvas.displayName = "SoulCanvas";

export default SoulCanvas;

