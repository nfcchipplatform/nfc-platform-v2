"use client";

import { useEffect, useRef, useState } from "react";

// --- アルゴリズム設定 ---
const POINT_COUNT = 60; // 頂点の数。多いほど滑らかですが計算負荷が上がります。
const CANVAS_SIZE = 500;

// 形状データの生成関数
const generateShape = (type: string) => {
  const points = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    const t = i / POINT_COUNT;
    let x = 0.5, y = 0.5;

    if (type === "CIRCLE") {
      const angle = t * Math.PI * 2;
      x = 0.5 + Math.cos(angle) * 0.3;
      y = 0.5 + Math.sin(angle) * 0.3;
    } else if (type === "TRIANGLE") {
      // 三角形の3辺の上に点を配置
      const side = Math.floor(t * 3);
      const localT = (t * 3) % 1;
      const v = [[0.5, 0.2], [0.8, 0.7], [0.2, 0.7], [0.5, 0.2]];
      x = v[side][0] + (v[side+1][0] - v[side][0]) * localT;
      y = v[side][1] + (v[side+1][1] - v[side][1]) * localT;
    } else if (type === "SQUARE") {
      const side = Math.floor(t * 4);
      const localT = (t * 4) % 1;
      const v = [[0.2, 0.2], [0.8, 0.2], [0.8, 0.8], [0.2, 0.8], [0.2, 0.2]];
      x = v[side][0] + (v[side+1][0] - v[side][0]) * localT;
      y = v[side][1] + (v[side+1][1] - v[side][1]) * localT;
    } else if (type === "STAR") {
      const angle = t * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 0.35 : 0.15;
      x = 0.5 + Math.cos(angle) * r;
      y = 0.5 + Math.sin(angle) * r;
    }
    points.push({ x, y });
  }
  return points;
};

export default function MoyamoyaSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetType, setTargetType] = useState<string>("WANDERING");
  const [isPressed, setIsPressed] = useState(false);
  
  // リアルタイムパラメーター
  const [speed, setSpeed] = useState(0.05);
  const [chaos, setChaos] = useState(0.5);
  const [color, setColor] = useState("#6366f1");

  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({
    x: Math.random(), y: Math.random(), vx: 0, vy: 0
  })));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      
      const targets = targetType === "WANDERING" ? null : generateShape(targetType);
      const currentPoints = pointsRef.current;

      // 1. 計算フェーズ
      currentPoints.forEach((p, i) => {
        // カオスな動き（ノイズ）
        p.vx += (Math.random() - 0.5) * chaos * 0.1;
        p.vy += (Math.random() - 0.5) * chaos * 0.1;

        // 形状への引力
        if (targets) {
          const target = targets[i];
          const dx = target.x - p.x;
          const dy = target.y - p.y;
          p.vx += dx * speed;
          p.vy += dy * speed;
        }

        // 親指アクション時の反発（PRESSED）
        if (isPressed) {
          const centerX = 0.5, centerY = 0.5;
          const dist = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
          const push = 0.05;
          p.vx += (p.x - centerX) * push;
          p.vy += (p.y - centerY) * push;
        }

        // 摩擦
        p.vx *= 0.9;
        p.vy *= 0.9;

        // 移動
        p.x += p.vx;
        p.y += p.vy;
      });

      // 2. 描画フェーズ
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = isPressed ? 4 : 2;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      currentPoints.forEach((p, i) => {
        const px = p.x * CANVAS_SIZE;
        const py = p.y * CANVAS_SIZE;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      
      ctx.closePath();
      ctx.stroke();

      // 点の描画（デバッグ用）
      currentPoints.forEach(p => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x * CANVAS_SIZE, p.y * CANVAS_SIZE, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetType, isPressed, speed, chaos, color]);

  return (
    <div className="p-8 bg-black min-h-screen text-white flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8 italic">MOYAMOYA ALGORITHM SANDBOX</h1>

      <div className="flex flex-col md:flex-row gap-12 items-start">
        {/* キャンバス */}
        <div className="relative bg-gray-900 rounded-full border-2 border-indigo-500/30 overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.2)]">
          <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="cursor-crosshair" />
          <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20 rounded-full"></div>
        </div>

        {/* コントロールパネル */}
        <div className="w-80 space-y-8 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <section className="space-y-3">
            <h3 className="text-xs font-black text-indigo-400 tracking-widest uppercase">Target Shape</h3>
            <div className="grid grid-cols-2 gap-2">
              {["WANDERING", "CIRCLE", "TRIANGLE", "SQUARE", "STAR"].map(type => (
                <button 
                  key={type} 
                  onClick={() => setTargetType(type)}
                  className={`px-3 py-2 text-[10px] font-bold rounded-lg transition-all ${targetType === type ? "bg-indigo-600 shadow-lg scale-105" : "bg-gray-800 hover:bg-gray-700 text-gray-400"}`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-800">
             <h3 className="text-xs font-black text-red-400 tracking-widest uppercase">Thumb Action</h3>
             <button 
                onPointerDown={() => setIsPressed(true)}
                onPointerUp={() => setIsPressed(false)}
                onPointerLeave={() => setIsPressed(false)}
                className={`w-full py-4 rounded-xl font-black transition-all ${isPressed ? "bg-red-600 scale-95 shadow-inner" : "bg-gray-800 border-2 border-red-900/50 text-red-500 shadow-lg"}`}
             >
                {isPressed ? "PRESSED!" : "HOLD TO PUSH"}
             </button>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-800">
            <h3 className="text-xs font-black text-gray-400 tracking-widest uppercase">Parameters</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] mb-1">Convergence Speed: {speed}</label>
                <input type="range" min="0.01" max="0.2" step="0.01" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] mb-1">Chaos Intensity: {chaos}</label>
                <input type="range" min="0" max="2" step="0.1" value={chaos} onChange={e => setChaos(parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] mb-1">Moyamoya Color</label>
                <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 bg-gray-800 rounded border-none cursor-pointer" />
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <p className="mt-12 text-gray-600 text-[10px] max-w-lg text-center leading-relaxed">
        このツールは、手のひらの中央で動く「モヤモヤ」の物理演算をシミュレートしています。
        各頂点は常にカオスな力を受けつつ、選択された形状の座標へと引き寄せられます。
        親指（PUSHボタン）を押すと、中心から外側へ向かう斥力が働き、形状が一時的に崩壊します。
      </p>
    </div>
  );
}