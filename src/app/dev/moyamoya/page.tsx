"use client";

import { useEffect, useRef, useState } from "react";

const POINT_COUNT = 60; // 密度を上げて波を綺麗に見せる
const CANVAS_SIZE = 600;

export default function MoyamoyaSoulSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetType, setTargetType] = useState<string>("BASE");
  const [isPressed, setIsPressed] = useState(false);
  
  // パラメーター
  const [metabolism, setMetabolism] = useState(0.04); // うねりの速さ
  const [waveAmp, setWaveAmp] = useState(15);      // うねりの強さ
  const [color, setColor] = useState("#22d3ee");

  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, (_, i) => ({
    x: 0.5, y: 0.5, vx: 0, vy: 0
  })));

  // 形状の基本座標（ターゲット）
  const getBaseTarget = (type: string, t: number) => {
    const angle = t * Math.PI * 2 - Math.PI / 2;
    if (type === "CIRCLE") return { x: 0.5 + Math.cos(angle) * 0.3, y: 0.5 + Math.sin(angle) * 0.3 };
    if (type === "TRIANGLE") {
      const side = Math.floor(t * 3);
      const lt = (t * 3) % 1;
      const v = [[0.5, 0.2], [0.8, 0.7], [0.2, 0.7], [0.5, 0.2]];
      return { x: v[side][0] + (v[side+1][0] - v[side][0]) * lt, y: v[side][1] + (v[side+1][1] - v[side][1]) * lt };
    }
    if (type === "SQUARE") {
      const side = Math.floor(t * 4);
      const lt = (t * 4) % 1;
      const v = [[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8], [0.2, 0.2]];
      return { x: v[side][0] + (v[side+1][0] - v[side][0]) * lt, y: v[side][1] + (v[side+1][1] - v[side][1]) * lt };
    }
    if (type === "STAR") {
      const r = (Math.floor(t * 10) % 2 === 0) ? 0.35 : 0.15;
      return { x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r };
    }
    return { x: 0.5 + Math.cos(angle) * 0.2, y: 0.5 + Math.sin(angle) * 0.2 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let time = 0;
    let animationFrameId: number;

    const render = () => {
      time += metabolism;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const pts = pointsRef.current;

      pts.forEach((p, i) => {
        const t = i / POINT_COUNT;
        const base = getBaseTarget(targetType, t);
        
        // --- 波のアルゴリズム ---
        // 形状の法線方向に波を乗せる（生き物のようなうねり）
        const wave = Math.sin(t * Math.PI * 10 + time) * (waveAmp / CANVAS_SIZE);
        const finalTargetX = base.x + (base.x - 0.5) * wave;
        const finalTargetY = base.y + (base.y - 0.5) * wave;

        // 親指が押されている時の反応（Interaction）
        const spring = isPressed ? 0.2 : 0.08;
        p.vx += (finalTargetX - p.x) * spring;
        p.vy += (finalTargetY - p.y) * spring;

        p.vx *= 0.8;
        p.vy *= 0.8;
        p.x += p.vx;
        p.y += p.vy;
      });

      // 描画（滑らかな曲線）
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 20;
      ctx.shadowColor = color;

      for (let i = 0; i <= pts.length; i++) {
        const p0 = pts[i % pts.length];
        const p1 = pts[(i + 1) % pts.length];
        const xc = (p0.x + p1.x) / 2 * CANVAS_SIZE;
        const yc = (p0.y + p1.y) / 2 * CANVAS_SIZE;
        if (i === 0) ctx.moveTo(xc, yc);
        else ctx.quadraticCurveTo(p0.x * CANVAS_SIZE, p0.y * CANVAS_SIZE, xc, yc);
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetType, isPressed, metabolism, waveAmp, color]);

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white flex flex-col items-center">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="bg-transparent" />

        <div className="w-72 space-y-8">
          <div className="space-y-4">
            <p className="text-[10px] tracking-widest text-cyan-500 font-bold uppercase">Form</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {["BASE", "CIRCLE", "TRIANGLE", "SQUARE", "STAR"].map(f => (
                <button key={f} onClick={() => setTargetType(f)} className={`py-2 rounded border ${targetType === f ? "bg-cyan-500 text-black" : "border-white/20 text-white/50"}`}>{f}</button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] tracking-widest text-red-500 font-bold uppercase">Interaction (Thumb Action)</p>
            <button 
              onPointerDown={() => setIsPressed(true)} 
              onPointerUp={() => setIsPressed(false)}
              className={`w-full py-4 rounded-xl border-2 transition-all font-black ${isPressed ? "bg-red-500 border-red-400" : "border-red-900/30 text-red-900"}`}>
              PRESS THUMB
            </button>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <label className="block text-[9px] uppercase text-white/40">Wave Speed</label>
            <input type="range" min="0.01" max="0.2" step="0.01" value={metabolism} onChange={e => setMetabolism(parseFloat(e.target.value))} className="w-full" />
            
            <label className="block text-[9px] uppercase text-white/40">Wave Amplitude (うねりの強さ)</label>
            <input type="range" min="0" max="50" value={waveAmp} onChange={e => setWaveAmp(parseInt(e.target.value))} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}