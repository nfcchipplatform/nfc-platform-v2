// src/components/SoulCanvas.tsx
"use client";

import { forwardRef, memo, useEffect, useImperativeHandle } from "react";
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
        onPointerDown,
        onPointerUp,
        onPointerLeave,
        onImageChange,
      },
      ref
    ) => {
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
        auraColor
      );

      useImperativeHandle(ref, () => ({ advanceImage, triggerExplosion }), [advanceImage, triggerExplosion]);

      useEffect(() => {
        onImageChange?.(currentSoulImage);
      }, [currentSoulImage, onImageChange]);

      if (!isAssetsReady) return null;

      return (
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
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
          }}
        />
      );
    }
  )
);

SoulCanvas.displayName = "SoulCanvas";

export default SoulCanvas;

