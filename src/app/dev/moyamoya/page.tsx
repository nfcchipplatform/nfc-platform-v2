"use client";

import { useEffect, useRef, useState } from "react";

// --- アルゴリズム定数 ---
const POINT_COUNT = 40; // 頂点数を調整して滑らかさを優先
const CANVAS_SIZE = 600;

export default function MoyamoyaSoulSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetType, setTargetType] = useState<string>("BASE"); // 最初は共通の「魂」状態
  const [isPressed, setIsPressed] = useState(false);
  
  // ユーザー調整パラメーター
  const [speed, setSpeed] = useState(0.03); // 生命の鼓動速度
  const [size, setSize] = useState(150);   // 全体の大きさ
  const [color, setColor] = useState("#a5f3fc"); // 魂の色（シアン系など）

  // 各頂点の物理状態を保持
  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, (_, i) => ({
    x: 0.5 + Math.cos((i / POINT_COUNT) * Math.PI * 2) * 0.2,
    y: 0.5 + Math.sin((i / POINT_COUNT) * Math.PI * 2) * 0.2,
    vx: 0, vy: 0,
    noiseOffset: Math.random() * 1000 // 個別のノイズ開始点
  })));

  // 形状座標生成
  const getTargetPos = (type: string, index: number) => {
    const t = index / POINT_COUNT;
    const angle = t * Math.PI * 2 - Math.PI / 2;
    
    if (type === "CIRCLE") {
      return { x: 0.5 + Math.cos(angle) * 0.3, y: 0.5 + Math.sin(angle) * 0.3 };
    }
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
      const r = index % 2 === 0 ? 0.35 : 0.15;
      return { x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r };
    }
    // BASE状態：緩やかな円
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
      time += speed;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      const pts = pointsRef.current;

      // 1. 物理演算：生命のゆらぎ
      pts.forEach((p, i) => {
        const target = getTargetPos(targetType, i);
        
        // 生き物のようなゆらぎ（サイン波を複合）
        const noiseX = Math.sin(time + p.noiseOffset) * 0.005;
        const noiseY = Math.cos(time * 0.8 + p.noiseOffset) * 0.005;

        // ターゲットへの吸着力
        const ad = 0.05; 
        p.vx += (target.x - p.x) * ad + noiseX;
        p.vy += (target.y - p.y) * ad + noiseY;

        // 親指アクション時の膨張
        if (isPressed) {
          const dx = p.x - 0.5;
          const dy = p.y - 0.5;
          p.vx += dx * 0.1;
          p.vy += dy * 0.1;
        }

        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
      });

      // 2. 有機的な描画（ベジェ曲線）
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      ctx.lineCap = "round";

      // 最初の点へ移動
      const startX = pts[0].x * CANVAS_SIZE;
      const startY = pts[0].y * CANVAS_SIZE;
      ctx.moveTo(startX, startY);

      // 曲線でつなぐ（Catmull-Rom風の簡略化）
      for (let i = 0; i < pts.length; i++) {
        const p0 = pts[i];
        const p1 = pts[(i + 1) % pts.length];
        const xc = (p0.x + p1.x) / 2 * CANVAS_SIZE;
        const yc = (p0.y + p1.y) / 2 * CANVAS_SIZE;
        ctx.quadraticCurveTo(p0.x * CANVAS_SIZE, p0.y * CANVAS_SIZE, xc, yc);
      }

      ctx.closePath();
      ctx.stroke();

      // 魂のコア（中心の淡い光）
      const grad = ctx.createRadialGradient(CANVAS_SIZE/2, CANVAS_SIZE/2, 0, CANVAS_SIZE/2, CANVAS_SIZE/2, size);
      grad.addColorStop(0, `${color}22`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetType, isPressed, speed, color, size]);

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white flex flex-col items-center font-sans">
      <h1 className="text-xl font-light tracking-[0.5em] mb-12 text-cyan-100 opacity-50">SOUL ALGORITHM</h1>

      <div className="flex flex-col lg:flex-row gap-16 items-center">
        {/* Moyamoya View */}
        <div className="relative">
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="rounded-full" />
          {/* 装飾用のリング */}
          <div className="absolute inset-0 border border-white/5 rounded-full scale-110 pointer-events-none"></div>
        </div>

        {/* Controls */}
        <div className="w-72 space-y-10">
          <div className="space-y-4">
            <p className="text-[10px] tracking-widest text-cyan-500 font-bold uppercase">Form Transformation</p>
            <div className="grid grid-cols-2 gap-2">
              {["BASE", "CIRCLE", "TRIANGLE", "SQUARE", "STAR"].map(f => (
                <button key={f} onClick={() => setTargetType(f)} 
                  className={`py-2 text-[10px] tracking-tighter rounded border ${targetType === f ? "bg-cyan-500 border-cyan-400 text-black font-black" : "border-white/10 text-white/40 hover:border-white/30"}`}>
                  {f === "BASE" ? "UNBOUND" : f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] tracking-widest text-red-500 font-bold uppercase">Interaction</p>
            <button 
              onPointerDown={() => setIsPressed(true)} 
              onPointerUp={() => setIsPressed(false)}
              className={`w-full py-4 rounded-full border-2 transition-all ${isPressed ? "bg-red-500 border-red-400 scale-95 shadow-[0_0_30px_rgba(239,68,68,0.5)]" : "border-red-900/30 text-red-900"}`}>
              ACTIVATE CORE
            </button>
          </div>

          <div className="space-y-6 pt-6 border-t border-white/10">
            <div className="space-y-2">
              <label className="flex justify-between text-[9px] uppercase tracking-widest text-white/40">Metabolism Speed <span>{speed}</span></label>
              <input type="range" min="0.005" max="0.1" step="0.005" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-cyan-500" />
            </div>
            <div className="space-y-2">
              <label className="flex justify-between text-[9px] uppercase tracking-widest text-white/40">Soul Scale <span>{size}</span></label>
              <input type="range" min="50" max="300" value={size} onChange={e => setSize(parseInt(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none accent-cyan-500" />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] uppercase tracking-widest text-white/40">Color Aura</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 bg-transparent border border-white/20 rounded cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}