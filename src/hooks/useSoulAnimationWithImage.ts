// src/hooks/useSoulAnimationWithImage.ts
// 画像表示機能付きの魂アニメーションフック

"use client";

import { useEffect, useRef, useState } from "react";
import { POINT_COUNT, AURA_COLORS, PURPLE_AURA_COLOR, SHAPE_LIBRARY } from "../constants/soulData";
import { selectSoulImage, ImageDisplayConfig, DEFAULT_IMAGE_DISPLAY_CONFIG } from "../lib/soulImageDisplayAlgorithm";
import { SoulImageConfig, SoulImageFilter, filterSoulImages, getAllSoulImages } from "../lib/soulImageConfig";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
}

function applySaturation(hex: string, saturationScale: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const nextS = Math.min(1, Math.max(0, s * saturationScale));
  return `hsl(${Math.round(h * 360)}, ${Math.round(nextS * 100)}%, ${Math.round(l * 100)}%)`;
}

export function useSoulAnimationWithImage(
  phase: "LOADING" | "STANDBY" | "PRESSED",
  imageDisplayConfig: ImageDisplayConfig = DEFAULT_IMAGE_DISPLAY_CONFIG,
  effect?: { forceShape?: string; burst?: boolean },
  filters: SoulImageFilter = {},
  progress: number = 0,
  auraOverride?: string,
  overlayImages: HTMLImageElement[] = [],
  overlayOpacity: number = 0.1
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const prefetchQueueRef = useRef<SoulImageConfig[]>([]);
  const usedImageIdsRef = useRef<Set<string>>(new Set());
  const [targetType, setTargetType] = useState<string>("BASE");
  const [auraColor, setAuraColor] = useState(AURA_COLORS[0]);
  const [isExploding, setIsExploding] = useState(false);
  const [currentSoulImage, setCurrentSoulImage] = useState<SoulImageConfig | null>(null);
  const currentImageIdRef = useRef<string | null>(null);

  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const purplePointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (auraOverride) {
      setAuraColor(auraOverride);
    }
  }, [auraOverride]);

  const preloadImage = (image: SoulImageConfig | null) => {
    if (!image) return;
    if (imageCacheRef.current.has(image.path)) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(image.path, img);
    };
    img.onerror = () => {
      console.error("Failed to load soul image:", image.path);
    };
    img.src = image.path;
  };

  const getNextUnseenImage = (): SoulImageConfig | null => {
    const allImages = filterSoulImages(filters);
    if (allImages.length === 0) {
      const fallback = getAllSoulImages();
      return fallback[0] ?? null;
    }

    // 未使用の画像を優先
    const unused = allImages.filter(img => !usedImageIdsRef.current.has(img.id));
    const pool = unused.length > 0 ? unused : allImages;

    // 全て使い切ったらリセット
    if (unused.length === 0) {
      usedImageIdsRef.current.clear();
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const selected = pool[randomIndex];
    usedImageIdsRef.current.add(selected.id);
    return selected;
  };

  const refillPrefetchQueue = () => {
    const prefetchCount = imageDisplayConfig.prefetchCount ?? 5;
    while (prefetchQueueRef.current.length < prefetchCount) {
      const candidate = getNextUnseenImage();
      if (!candidate) break;
      prefetchQueueRef.current.push(candidate);
      preloadImage(candidate);
    }
  };

  const getNextImage = (): SoulImageConfig | null => {
    if (prefetchQueueRef.current.length === 0) {
      refillPrefetchQueue();
    }
    const next = prefetchQueueRef.current.shift() || null;
    refillPrefetchQueue();
    return next;
  };

  // 画像を選択して読み込む（先読みキューから取得）
  useEffect(() => {
    if (!imageDisplayConfig.enabled) {
      imageRef.current = null;
      imageCacheRef.current.clear();
      prefetchQueueRef.current = [];
      usedImageIdsRef.current.clear();
      setCurrentSoulImage(null);
      return;
    }

    const selectedImage = getNextImage();
    if (!selectedImage) {
      setCurrentSoulImage(null);
      return;
    }

    setCurrentSoulImage(selectedImage);
    currentImageIdRef.current = selectedImage.path;

    const cached = imageCacheRef.current.get(selectedImage.path);
    if (cached) {
      imageRef.current = cached;
      return;
    }

    // キャッシュにない場合は読み込み開始し、前の画像を維持
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(selectedImage.path, img);
      if (currentImageIdRef.current === selectedImage.path) {
        imageRef.current = img;
      }
    };
    img.onerror = () => {
      console.error("Failed to load soul image:", selectedImage.path);
    };
    img.src = selectedImage.path;
  }, [imageDisplayConfig, targetType, filters]);

  useEffect(() => {
    prefetchQueueRef.current = [];
    usedImageIdsRef.current.clear();
    setCurrentSoulImage(null);
  }, [filters]);

  const advanceImage = () => {
    if (!imageDisplayConfig.enabled) return;
    const nextImage = getNextImage();
    if (!nextImage) return;
    setCurrentSoulImage(nextImage);
    currentImageIdRef.current = nextImage.path;

    const cached = imageCacheRef.current.get(nextImage.path);
    if (cached) {
      imageRef.current = cached;
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageCacheRef.current.set(nextImage.path, img);
      if (currentImageIdRef.current === nextImage.path) {
        imageRef.current = img;
      }
    };
    img.onerror = () => {
      console.error("Failed to load soul image:", nextImage.path);
    };
    img.src = nextImage.path;
  };

  const triggerExplosion = () => {
    if (targetType === "BASE" || isExploding) return;
    setIsExploding(true);
    setTimeout(() => {
      setIsExploding(false);
      setTargetType("BASE");
    }, 1500);
  };

  useEffect(() => {
    if (phase !== "STANDBY" || isExploding) return;
    const cycle = setInterval(() => {
      if (phaseRef.current !== "STANDBY") return;
      const keys = Object.keys(SHAPE_LIBRARY).filter((key) => key !== "HEART");
      setTargetType(keys[Math.floor(Math.random() * keys.length)]);
      if (!auraOverride) {
        setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]);
      }
      setTimeout(() => { if (phaseRef.current !== "PRESSED") setTargetType("BASE"); }, 5000);
    }, 10000);
    return () => clearInterval(cycle);
  }, [phase, isExploding, auraOverride]);

  useEffect(() => { 
    if (phase === "PRESSED") { 
      setTargetType("BASE"); 
      if (!auraOverride) {
        setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]); 
      }
    } 
  }, [phase, auraOverride]);

  // ハートが残っている場合は通常形状に戻す
  useEffect(() => {
    if (targetType === "HEART" && effect?.forceShape !== "HEART") {
      setTargetType("BASE");
    }
  }, [targetType, effect?.forceShape]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === "LOADING") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let time = 0;
    let animationFrameId: number;

    const render = () => {
      const speed = 1 + Math.min(1, Math.max(0, progress)) * 1.5;
      time += 0.04 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      [pointsRef.current, purplePointsRef.current].forEach((pts, layer) => {
        if (layer === 1 && phase !== "PRESSED") return;
        // PRESSED状態の時は常に丸型（BASE）にして大きく表示
        const baseType = phase === "PRESSED" ? "BASE" : (layer === 1 ? "BASE" : targetType);
        const currentType = effect?.forceShape ?? baseType;
        const currentTime = layer === 1 ? time * 2.5 : time;
        
        pts.forEach((p, i) => {
          if (isExploding && layer === 0) {
            p.vy -= 0.005;
            p.x += p.vx;
            p.y += p.vy;
            return;
          }
          if (effect?.burst && layer === 0) {
            // 外側へ弾ける演出
            p.vx += (p.x - 0.5) * 0.04;
            p.vy += (p.y - 0.5) * 0.04;
          }
          
          let tx, ty;
          if (currentType === "BASE") {
            // PRESSED状態の時は大きく丸型に広がる
            const baseRadius = phase === "PRESSED" ? 0.35 : 0.14; // PRESSED時は大きく
            let r = baseRadius;
            // PRESSED状態の時は波を小さくして滑らかな円に近づける
            const waveAmplitude = phase === "PRESSED" ? 0.02 : 0.05;
            for (let j = 1; j <= 4; j++) {
              r += Math.sin((i/POINT_COUNT) * Math.PI * (38 * j * 0.5) + currentTime * j) * (waveAmplitude / j);
            }
            tx = 0.5 + Math.cos((i/POINT_COUNT) * Math.PI * 2 - Math.PI / 2) * r;
            ty = 0.5 + Math.sin((i/POINT_COUNT) * Math.PI * 2 - Math.PI / 2) * r;
          } else {
            const base = SHAPE_LIBRARY[currentType](i/POINT_COUNT);
            const wave = Math.sin((i/POINT_COUNT) * Math.PI * 12 + currentTime * 1.5) * (15 / 600);
            tx = base.x + (base.x - 0.5) * wave;
            ty = base.y + (base.y - 0.5) * wave;
          }
          
          p.vx += (tx - p.x) * 0.08;
          p.vy += (ty - p.y) * 0.08;
          p.vx *= 0.8;
          p.vy *= 0.8;
          p.x += p.vx;
          p.y += p.vy;
        });

        // 画像を表示する場合の処理（線を描画する前に画像を描画）
        if (imageDisplayConfig.enabled && imageRef.current && layer === 0) {
          // 魂の形状をパスとして作成
          ctx.save();
          ctx.beginPath();
          for (let i = 0; i <= pts.length; i++) {
            const p0 = pts[i % pts.length];
            const p1 = pts[(i+1) % pts.length];
            const xc = (p0.x + p1.x)/2 * canvas.width;
            const yc = (p0.y + p1.y)/2 * canvas.height;
            if (i === 0) ctx.moveTo(xc, yc);
            else ctx.quadraticCurveTo(p0.x * canvas.width, p0.y * canvas.height, xc, yc);
          }
          ctx.closePath();
          
          // クリッピングマスクとして使用
          ctx.clip();
          
          // 画像を描画（魂の形状に合わせて）
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          const imgSize = Math.min(canvas.width, canvas.height) * 0.8;
          
          ctx.globalCompositeOperation = "source-over";

          if (overlayImages.length > 0) {
            ctx.save();
            ctx.globalAlpha = overlayOpacity;
            overlayImages.forEach((img) => {
              ctx.drawImage(
                img,
                centerX - imgSize / 2,
                centerY - imgSize / 2,
                imgSize,
                imgSize
              );
            });
            ctx.restore();
          }

          ctx.drawImage(
            imageRef.current,
            centerX - imgSize / 2,
            centerY - imgSize / 2,
            imgSize,
            imgSize
          );
          
          ctx.restore();
        }
        
        // 魂の線を描画（画像の上に重ねる）
        ctx.beginPath();
        const saturationScale = 1 + Math.min(1, Math.max(0, progress)) * 0.7;
        const baseColor = layer === 1 ? PURPLE_AURA_COLOR : (auraOverride ?? auraColor);
        ctx.strokeStyle = applySaturation(baseColor, saturationScale);
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.strokeStyle as string;
        ctx.globalCompositeOperation = "screen";
        
        for (let i = 0; i <= pts.length; i++) {
          const p0 = pts[i % pts.length];
          const p1 = pts[(i+1) % pts.length];
          const xc = (p0.x + p1.x)/2 * canvas.width;
          const yc = (p0.y + p1.y)/2 * canvas.height;
          if (i === 0) ctx.moveTo(xc, yc);
          else ctx.quadraticCurveTo(p0.x * canvas.width, p0.y * canvas.height, xc, yc);
        }
        ctx.stroke();
        
        ctx.globalCompositeOperation = "source-over";
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetType, auraColor, phase, isExploding, imageDisplayConfig, progress]);

  return { 
    canvasRef, 
    targetType, 
    triggerExplosion, 
    isExploding,
    currentSoulImage,
    advanceImage
  };
}

