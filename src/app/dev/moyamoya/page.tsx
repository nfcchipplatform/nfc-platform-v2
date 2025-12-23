"use client";

import { useEffect, useRef, useState } from "react";

const POINT_COUNT = 120; // さらに密度を上げ、複雑な重なりを表現可能に
const CANVAS_SIZE = 600;
const FIXED_WAVE_AMP = 15; // 形状時は固定

export default function MoyamoyaSoulSandbox() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetType, setTargetType] = useState<string>("BASE");
  
  // --- BASE専用のチューニングパラメーター ---
  const [baseRadius, setBaseRadius] = useState(0.2);     // 基本の大きさ
  const [baseComplexity, setBaseComplexity] = useState(3); // 重ねる波の数
  const [baseFreq, setBaseFreq] = useState(10);           // 線のうねり回数
  const [baseJitter, setBaseJitter] = useState(0.08);     // 線の乱れ（重なり具合）
  const [metabolism, setMetabolism] = useState(0.03);    // 全体の動く速さ
  const [color, setColor] = useState("#22d3ee");

  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({
    x: 0.5, y: 0.5, vx: 0, vy: 0
  })));

  // 形状の基本座標取得
  const getBaseTarget = (type: string, t: number, time: number) => {
    const angle = t * Math.PI * 2 - Math.PI / 2;
    
    // --- BASE: 手動チューニングアルゴリズム ---
    if (type === "BASE") {
      let r = baseRadius;
      // 指定したComplexityの分だけ異なる波を重ねる
      for (let j = 1; j <= baseComplexity; j++) {
        const freqMult = baseFreq * (j * 0.5);
        const ampMult = baseJitter / j;
        r += Math.sin(t * Math.PI * freqMult + time * j) * ampMult;
        r += Math.cos(t * Math.PI * (freqMult * 0.7) - time * 0.5) * (ampMult * 0.5);
      }
      return { x: 0.5 + Math.cos(angle) * r, y: 0.5 + Math.sin(angle) * r };
    }

    // --- 各形状（アルゴリズム固定） ---
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
    return { x: 0.5, y: 0.5 };
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
        const base = getBaseTarget(targetType, t, time);
        
        // --- 形状時の固定うねり ---
        const currentWaveAmp = targetType === "BASE" ? 0 : FIXED_WAVE_AMP;
        const wave = Math.sin(t * Math.PI * 12 + time * 1.5) * (currentWaveAmp / CANVAS_SIZE);
        
        const finalTargetX = base.x + (base.x - 0.5) * wave;
        const finalTargetY = base.y + (base.y - 0.5) * wave;

        // 引力（常に一定の滑らかさ）
        const spring = 0.08;
        p.vx += (finalTargetX - p.x) * spring;
        p.vy += (finalTargetY - p.y) * spring;

        p.vx *= 0.8;
        p.vy *= 0.8;
        p.x += p.vx;
        p.y += p.vy;
      });

      // 描画
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
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
  }, [targetType, metabolism, baseRadius, baseComplexity, baseFreq, baseJitter, color]);

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white flex flex-col items-center font-sans">
      <div className="flex flex-col lg:flex-row gap-16 items-center">
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} />

        <div className="w-80 space-y-8">
          <section className="space-y-4">
            <p className="text-[10px] tracking-widest text-cyan-500 font-bold uppercase underline">Phase Select</p>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              {["BASE", "CIRCLE", "TRIANGLE", "SQUARE", "STAR"].map(f => (
                <button key={f} onClick={() => setTargetType(f)} className={`py-2 rounded border transition-colors ${targetType === f ? "bg-cyan-500 text-black font-bold" : "border-white/20 text-white/50"}`}>
                  {f === "BASE" ? "TUNING BASE" : f}
                </button>
              ))}
            </div>
          </section>

          {/* BASE専用のチューニングコントロールパネル */}
          {targetType === "BASE" && (
            <section className="space-y-6 p-6 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl">
              <p className="text-[10px] tracking-widest text-cyan-400 font-black uppercase">Base Tuning Options</p>
              
              <div className="space-y-1">
                <label className="flex justify-between text-[9px] uppercase text-white/40">Core Radius <span>{baseRadius.toFixed(2)}</span></label>
                <input type="range" min="0.05" max="0.4" step="0.01" value={baseRadius} onChange={e => setBaseRadius(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
              </div>

              <div className="space-y-1">
                <label className="flex justify-between text-[9px] uppercase text-white/40">Complexity (波の重なり) <span>{baseComplexity}</span></label>
                <input type="range" min="1" max="10" step="1" value={baseComplexity} onChange={e => setBaseComplexity(parseInt(e.target.value))} className="w-full accent-cyan-500" />
              </div>

              <div className="space-y-1">
                <label className="flex justify-between text-[9px] uppercase text-white/40">Tangle Freq (絡まり具合) <span>{baseFreq}</span></label>
                <input type="range" min="1" max="50" step="1" value={baseFreq} onChange={e => setBaseFreq(parseInt(e.target.value))} className="w-full accent-cyan-500" />
              </div>

              <div className="space-y-1">
                <label className="flex justify-between text-[9px] uppercase text-white/40">Jitter (乱れ/重なり) <span>{baseJitter.toFixed(2)}</span></label>
                <input type="range" min="0" max="0.3" step="0.01" value={baseJitter} onChange={e => setBaseJitter(parseFloat(e.target.value))} className="w-full accent-cyan-500" />
              </div>
            </section>
          )}

          <section className="space-y-4 pt-6 border-t border-white/10">
            <div>
              <label className="block text-[9px] uppercase text-white/40 mb-2">Soul Metabolism (速さ)</label>
              <input type="range" min="0.01" max="0.1" step="0.01" value={metabolism} onChange={e => setMetabolism(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="block text-[9px] uppercase text-white/40 mb-2">Aura Color</label>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-full h-8 bg-transparent border border-white/20 rounded cursor-pointer" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}