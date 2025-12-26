// src/hooks/useSoulAnimationWithImage.ts
// 画像表示機能付きの魂アニメーションフック

"use client";

import { useEffect, useRef, useState } from "react";
import { POINT_COUNT, AURA_COLORS, PURPLE_AURA_COLOR, SHAPE_LIBRARY } from "../constants/soulData";
import { selectSoulImage, ImageDisplayConfig, DEFAULT_IMAGE_DISPLAY_CONFIG } from "../lib/soulImageDisplayAlgorithm";
import { SoulImageConfig } from "../lib/soulImageConfig";

export function useSoulAnimationWithImage(
  phase: "LOADING" | "STANDBY" | "PRESSED",
  imageDisplayConfig: ImageDisplayConfig = DEFAULT_IMAGE_DISPLAY_CONFIG
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [targetType, setTargetType] = useState<string>("BASE");
  const [auraColor, setAuraColor] = useState(AURA_COLORS[0]);
  const [isExploding, setIsExploding] = useState(false);
  const [currentSoulImage, setCurrentSoulImage] = useState<SoulImageConfig | null>(null);

  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const purplePointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // 画像を選択して読み込む
  useEffect(() => {
    if (!imageDisplayConfig.enabled) {
      imageRef.current = null;
      setCurrentSoulImage(null);
      return;
    }

    const selectedImage = selectSoulImage(imageDisplayConfig, targetType, phase);
    if (!selectedImage) {
      imageRef.current = null;
      setCurrentSoulImage(null);
      return;
    }

    setCurrentSoulImage(selectedImage);
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
    };
    img.onerror = () => {
      console.error("Failed to load soul image:", selectedImage.path);
      imageRef.current = null;
    };
    img.src = selectedImage.path;
  }, [imageDisplayConfig, targetType, phase]);

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
      const keys = Object.keys(SHAPE_LIBRARY);
      setTargetType(keys[Math.floor(Math.random() * keys.length)]);
      setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]);
      setTimeout(() => { if (phaseRef.current !== "PRESSED") setTargetType("BASE"); }, 5000);
    }, 10000);
    return () => clearInterval(cycle);
  }, [phase, isExploding]);

  useEffect(() => { 
    if (phase === "PRESSED") { 
      setTargetType("BASE"); 
      setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]); 
    } 
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === "LOADING") return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let time = 0;
    let animationFrameId: number;

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      [pointsRef.current, purplePointsRef.current].forEach((pts, layer) => {
        if (layer === 1 && phase !== "PRESSED") return;
        // PRESSED状態の時は常に丸型（BASE）にして大きく表示
        const currentType = phase === "PRESSED" ? "BASE" : (layer === 1 ? "BASE" : targetType);
        const currentTime = layer === 1 ? time * 2.5 : time;
        
        pts.forEach((p, i) => {
          if (isExploding && layer === 0) {
            p.vy -= 0.005;
            p.x += p.vx;
            p.y += p.vy;
            return;
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
        ctx.strokeStyle = layer === 1 ? PURPLE_AURA_COLOR : auraColor;
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
  }, [targetType, auraColor, phase, isExploding, imageDisplayConfig]);

  return { 
    canvasRef, 
    targetType, 
    triggerExplosion, 
    isExploding,
    currentSoulImage 
  };
}

