"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface ProfileSummary {
  id: string; username: string | null; name: string | null; image: string | null;
}

interface InteractiveHandProps { slots: (ProfileSummary | null)[]; }

const NAIL_CONFIG = [
  { id: "thumb",  x: 54.06, y: 63.36, w: 7.7, h: 12.4, r: -124, br: "45% 45% 20% 20%" },
  { id: "index",  x: 56.27, y: 51.23, w: 7.6, h: 9.7,  r: 161,  br: "45% 45% 20% 20%" },
  { id: "middle", x: 44.79, y: 53.38, w: 8.0, h: 10.1, r: 164,  br: "45% 45% 20% 20%" },
  { id: "ring",   x: 33.76, y: 55.04, w: 7.7, h: 10.0, r: 167,  br: "45% 45% 20% 20%" },
  { id: "pinky",  x: 25.15, y: 54.71, w: 6.3, h: 9.0,  r: 159,  br: "45% 45% 20% 20%" },
];

const AURA_COLORS = ["#22d3ee", "#6366f1", "#f43f5e", "#f59e0b", "#10b981"];
const POINT_COUNT = 100;

// ★【形状ライブラリ】ここに追加するだけで、自動でランダム遷移の対象になります
const SHAPE_LIBRARY: Record<string, (t: number) => { x: number, y: number }> = {
  CIRCLE: (t) => {
    const a = t * Math.PI * 2 - Math.PI / 2;
    return { x: 0.5 + Math.cos(a) * 0.25, y: 0.55 + Math.sin(a) * 0.25 };
  },
  TRIANGLE: (t) => {
    const s = Math.floor(t * 3); const lt = (t * 3) % 1;
    const v = [[0.5, 0.35], [0.72, 0.68], [0.28, 0.68], [0.5, 0.35]];
    return { x: v[s][0] + (v[s+1][0] - v[s][0]) * lt, y: v[s][1] + (v[s+1][1] - v[s][1]) * lt };
  },
  SQUARE: (t) => {
    const s = Math.floor(t * 4); const lt = (t * 4) % 1;
    const v = [[0.35, 0.42], [0.65, 0.42], [0.65, 0.72], [0.35, 0.72], [0.35, 0.42]];
    return { x: v[s][0] + (v[s+1][0] - v[s][0]) * lt, y: v[s][1] + (v[s+1][1] - v[s][1]) * lt };
  },
  STAR: (t) => {
    const a = t * Math.PI * 2 - Math.PI / 2;
    const r = (Math.floor(t * 10) % 2 === 0) ? 0.28 : 0.12;
    return { x: 0.5 + Math.cos(a) * r, y: 0.57 + Math.sin(a) * r };
  }
};

export default function InteractiveHand({ slots }: InteractiveHandProps) {
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetType, setTargetType] = useState<string>("BASE");
  const [auraColor, setAuraColor] = useState(AURA_COLORS[0]);
  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));

  useEffect(() => {
    const images = ["/handclose.png", "/handgoo.png", ...slots.filter(s => s?.image).map(s => s!.image as string)];
    const preload = async () => {
      await Promise.all(images.map(src => new Promise(res => {
        const img = new Image(); img.src = src; img.onload = res; img.onerror = res;
      })));
      setTimeout(() => { setIsAssetsReady(true); setPhase("STANDBY"); }, 2000);
    };
    preload();
  }, [slots]);

  // 自動変身サイクル（10秒）
  useEffect(() => {
    if (phase !== "STANDBY") return;
    const cycle = setInterval(() => {
      const keys = Object.keys(SHAPE_LIBRARY);
      const nextShape = keys[Math.floor(Math.random() * keys.length)];
      setTargetType(nextShape);
      setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]);
      setTimeout(() => { if (phase !== "PRESSED") setTargetType("BASE"); }, 5000);
    }, 10000);
    return () => clearInterval(cycle);
  }, [phase]);

  // 親指アクションで即リセット
  useEffect(() => { if (phase === "PRESSED") setTargetType("BASE"); }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === "LOADING") return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let time = 0; let animationFrameId: number;

    const render = () => {
      time += 0.04; ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = pointsRef.current;
      pts.forEach((p, i) => {
        const t = i / POINT_COUNT;
        let tx, ty;
        
        if (targetType === "BASE") {
          // BASEは固定パラメーターで複雑に作画
          let r = 0.14; 
          for (let j = 1; j <= 4; j++) r += Math.sin(t * Math.PI * (38 * j * 0.5) + time * j) * (0.05 / j);
          tx = 0.5 + Math.cos(t * Math.PI * 2 - Math.PI / 2) * r;
          ty = 0.52 + Math.sin(t * Math.PI * 2 - Math.PI / 2) * r;
        } else {
          // 図形ライブラリから取得
          const base = SHAPE_LIBRARY[targetType](t);
          const wave = Math.sin(t * Math.PI * 12 + time * 1.5) * (15 / 600);
          tx = base.x + (base.x - 0.5) * wave; ty = base.y + (base.y - 0.5) * wave;
        }
        p.vx += (tx - p.x) * 0.08; p.vy += (ty - p.y) * 0.08;
        p.vx *= 0.8; p.vy *= 0.8; p.x += p.vx; p.y += p.vy;
      });

      ctx.beginPath(); ctx.strokeStyle = auraColor; ctx.lineWidth = 2;
      ctx.shadowBlur = 15; ctx.shadowColor = auraColor;
      for (let i = 0; i <= pts.length; i++) {
        const p0 = pts[i % pts.length], p1 = pts[(i + 1) % pts.length];
        const xc = (p0.x + p1.x) / 2 * canvas.width, yc = (p0.y + p1.y) / 2 * canvas.height;
        if (i === 0) ctx.moveTo(xc, yc); else ctx.quadraticCurveTo(p0.x * canvas.width, p0.y * canvas.height, xc, yc);
      }
      ctx.stroke();
      animationFrameId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetType, auraColor, phase]);

  return (
    <div className="relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent" onContextMenu={(e) => e.preventDefault()}>
      <div className={`absolute inset-0 transition-opacity duration-700 bg-contain bg-center bg-no-repeat ${isAssetsReady ? "opacity-100" : "opacity-90"}`}
        style={{ backgroundImage: `url(${phase === "PRESSED" ? "/handgoo.png" : phase === "LOADING" ? "/handopen.png" : "/handclose.png"})` }}
        onPointerDown={() => setPhase("PRESSED")} onPointerUp={() => setPhase("STANDBY")} onPointerLeave={() => setPhase("STANDBY")}
      />
      <canvas ref={canvasRef} width={400} height={400} className="absolute left-1/2 top-[62%] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-80" />
      {NAIL_CONFIG.map((config, index) => {
        const user = slots[index];
        const isVisible = phase !== "LOADING" && (config.id !== "thumb" || phase === "PRESSED");
        if (!user) return null;
        return (
          <Link key={config.id} href={`/${user.username}`}
            className={`absolute block border-2 border-black overflow-hidden bg-cover bg-center group active:scale-95 transition-all duration-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
            style={{ left: `${config.x}%`, top: `${config.y}%`, width: `${config.w}%`, height: `${config.h}%`, transform: `translate(-50%, -50%) rotate(${config.r}deg)`, zIndex: config.id === "thumb" ? 50 : 40, borderRadius: config.br, backgroundImage: `url(${user.image})`, WebkitTouchCallout: 'none' }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}