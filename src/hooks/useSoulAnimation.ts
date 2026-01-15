// src/hooks/useSoulAnimation.ts
"use client";

import { useEffect, useRef, useState } from "react";
import { POINT_COUNT, AURA_COLORS, PURPLE_AURA_COLOR, SHAPE_LIBRARY } from "../constants/soulData";

export function useSoulAnimation(phase: "LOADING" | "STANDBY" | "PRESSED") {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetType, setTargetType] = useState<string>("BASE");
  const [auraColor, setAuraColor] = useState(AURA_COLORS[0]);
  const [isExploding, setIsExploding] = useState(false);

  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const purplePointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

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
      setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]);
      setTimeout(() => { if (phaseRef.current !== "PRESSED") setTargetType("BASE"); }, 5000);
    }, 10000);
    return () => clearInterval(cycle);
  }, [phase, isExploding]);

  useEffect(() => { if (phase === "PRESSED") { setTargetType("BASE"); setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]); } }, [phase]);

  // ハートが残っている場合は通常形状に戻す
  useEffect(() => {
    if (targetType === "HEART") {
      setTargetType("BASE");
    }
  }, [targetType]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === "LOADING") return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let time = 0; let animationFrameId: number;

    const render = () => {
      time += 0.04; ctx.clearRect(0, 0, canvas.width, canvas.height);
      [pointsRef.current, purplePointsRef.current].forEach((pts, layer) => {
        if (layer === 1 && phase !== "PRESSED") return;
        const currentType = layer === 1 ? "BASE" : targetType;
        const currentTime = layer === 1 ? time * 2.5 : time;
        pts.forEach((p, i) => {
          if (isExploding && layer === 0) {
            p.vy -= 0.005; p.x += p.vx; p.y += p.vy; return;
          }
          let tx, ty;
          if (currentType === "BASE") {
            let r = 0.14; for (let j = 1; j <= 4; j++) r += Math.sin((i/POINT_COUNT) * Math.PI * (38 * j * 0.5) + currentTime * j) * (0.05 / j);
            tx = 0.5 + Math.cos((i/POINT_COUNT) * Math.PI * 2 - Math.PI / 2) * r; ty = 0.5 + Math.sin((i/POINT_COUNT) * Math.PI * 2 - Math.PI / 2) * r;
          } else {
            const base = SHAPE_LIBRARY[currentType](i/POINT_COUNT);
            const wave = Math.sin((i/POINT_COUNT) * Math.PI * 12 + currentTime * 1.5) * (15 / 600);
            tx = base.x + (base.x - 0.5) * wave; ty = base.y + (base.y - 0.5) * wave;
          }
          p.vx += (tx - p.x) * 0.08; p.vy += (ty - p.y) * 0.08;
          p.vx *= 0.8; p.vy *= 0.8; p.x += p.vx; p.y += p.vy;
        });
        ctx.beginPath(); ctx.strokeStyle = layer === 1 ? PURPLE_AURA_COLOR : auraColor; ctx.lineWidth = 2.5; ctx.shadowBlur = 15; ctx.shadowColor = ctx.strokeStyle as string;
        ctx.globalCompositeOperation = "screen";
        for (let i = 0; i <= pts.length; i++) {
          const p0 = pts[i % pts.length], p1 = pts[(i+1) % pts.length];
          const xc = (p0.x + p1.x)/2 * canvas.width, yc = (p0.y + p1.y)/2 * canvas.height;
          if (i === 0) ctx.moveTo(xc, yc); else ctx.quadraticCurveTo(p0.x * canvas.width, p0.y * canvas.height, xc, yc);
        }
        ctx.stroke(); ctx.globalCompositeOperation = "source-over";
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render(); return () => cancelAnimationFrame(animationFrameId);
  }, [targetType, auraColor, phase, isExploding]);

  return { canvasRef, targetType, triggerExplosion, isExploding };
}