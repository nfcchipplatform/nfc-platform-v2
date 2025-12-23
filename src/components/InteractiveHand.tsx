"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// --- 1. 型定義 ---
interface ProfileSummary {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

interface InteractiveHandProps {
  slots: (ProfileSummary | null)[];
}

// --- 2. 定数・ライブラリ設定 ---
const POINT_COUNT = 100;
const AURA_COLORS = ["#22d3ee", "#6366f1", "#f43f5e", "#f59e0b", "#10b981"];
// ★追加: 重ねる紫色の定義 (鮮やかな紫)
const PURPLE_AURA_COLOR = "#a855f7"; 

const NAIL_CONFIG = [
  { id: "thumb",  x: 54.06, y: 63.36, w: 7.7, h: 12.4, r: -124, br: "45% 45% 20% 20%" },
  { id: "index",  x: 56.27, y: 51.23, w: 7.6, h: 9.7,  r: 161,  br: "45% 45% 20% 20%" },
  { id: "middle", x: 44.79, y: 53.38, w: 8.0, h: 10.1, r: 164,  br: "45% 45% 20% 20%" },
  { id: "ring",   x: 33.76, y: 55.04, w: 7.7, h: 10.0, r: 167,  br: "45% 45% 20% 20%" },
  { id: "pinky",  x: 25.15, y: 54.71, w: 6.3, h: 9.0,  r: 159,  br: "45% 45% 20% 20%" },
];

const SHAPE_LIBRARY: Record<string, (t: number) => { x: number, y: number }> = {
  CIRCLE: (t) => {
    const a = t * Math.PI * 2 - Math.PI / 2;
    return { x: 0.5 + Math.cos(a) * 0.25, y: 0.5 + Math.sin(a) * 0.25 };
  },
  TRIANGLE: (t) => {
    const s = Math.floor(t * 3); const lt = (t * 3) % 1;
    const v = [[0.5, 0.3], [0.75, 0.7], [0.25, 0.7], [0.5, 0.3]];
    return { x: v[s][0] + (v[s+1][0] - v[s][0]) * lt, y: v[s][1] + (v[s+1][1] - v[s][1]) * lt };
  },
  SQUARE: (t) => {
    const s = Math.floor(t * 4); const lt = (t * 4) % 1;
    const v = [[0.3, 0.3], [0.7, 0.3], [0.7, 0.7], [0.3, 0.7], [0.3, 0.3]];
    return { x: v[s][0] + (v[s+1][0] - v[s][0]) * lt, y: v[s][1] + (v[s+1][1] - v[s][1]) * lt };
  },
  STAR: (t) => {
    const a = t * Math.PI * 2 - Math.PI / 2;
    const r = (Math.floor(t * 10) % 2 === 0) ? 0.3 : 0.12;
    return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r };
  }
};

export default function InteractiveHand({ slots }: InteractiveHandProps) {
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [targetType, setTargetType] = useState<string>("BASE");
  const [auraColor, setAuraColor] = useState(AURA_COLORS[0]);
  
  // 通常レイヤー用の頂点
  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  // ★追加: 紫レイヤー専用の独立した頂点データ
  const purplePointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));

  const phaseRef = useRef(phase);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // 1. 画像のプリロード
  useEffect(() => {
    const images = ["/handclose.png", "/handgoo.png", "/handopen.png", ...slots.filter(s => s?.image).map(s => s!.image as string)];
    const preload = async () => {
      await Promise.all(images.map(src => new Promise<void>((res) => {
        const img = new Image(); img.src = src; img.onload = () => res(); img.onerror = () => res();
      })));
      setTimeout(() => { setIsAssetsReady(true); setPhase("STANDBY"); }, 2000);
    };
    preload();
  }, [slots]);

  // 2. 10秒ごとの自動変身サイクル
  useEffect(() => {
    if (phase !== "STANDBY") return;
    const cycle = setInterval(() => {
      if (phaseRef.current !== "STANDBY") return;
      const keys = Object.keys(SHAPE_LIBRARY);
      const nextShape = keys[Math.floor(Math.random() * keys.length)];
      setTargetType(nextShape);
      setAuraColor(AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)]);
      setTimeout(() => { if (phaseRef.current !== "PRESSED") setTargetType("BASE"); }, 5000);
    }, 10000);
    return () => clearInterval(cycle);
  }, [phase]);

  // 3. 親指アクション時の挙動
  useEffect(() => {
    if (phase === "PRESSED") {
      setTargetType("BASE");
      const nextColor = AURA_COLORS[Math.floor(Math.random() * AURA_COLORS.length)];
      setAuraColor(nextColor);
    }
  }, [phase]);

  // 4. 魂の描画エンジン (大幅に改修)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || phase === "LOADING") return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    let time = 0; let animationFrameId: number;

    // --- ヘルパー関数: ターゲット座標計算 (共通化) ---
    const calculateTargetPos = (type: string, t: number, currentTime: number) => {
      if (type === "BASE") {
        // チューニング済みBASE値
        let r = 0.14; 
        for (let j = 1; j <= 4; j++) r += Math.sin(t * Math.PI * (38 * j * 0.5) + currentTime * j) * (0.05 / j);
        return {
          x: 0.5 + Math.cos(t * Math.PI * 2 - Math.PI / 2) * r,
          y: 0.5 + Math.sin(t * Math.PI * 2 - Math.PI / 2) * r
        };
      } else {
        // 形状
        const base = SHAPE_LIBRARY[type](t);
        const wave = Math.sin(t * Math.PI * 12 + currentTime * 1.5) * (15 / 600);
        return {
          x: base.x + (base.x - 0.5) * wave,
          y: base.y + (base.y - 0.5) * wave
        };
      }
    };

    // --- ヘルパー関数: スプライン曲線描画 (共通化) ---
    const drawSpline = (points: any[], color: string) => {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 15;
      ctx.shadowColor = color;
      // 重ね合わせ効果のために合成モードを変更
      ctx.globalCompositeOperation = "screen"; 

      for (let i = 0; i <= points.length; i++) {
        const p0 = points[i % points.length];
        const p1 = points[(i + 1) % points.length];
        const xc = (p0.x + p1.x) / 2 * canvas.width;
        const yc = (p0.y + p1.y) / 2 * canvas.height;
        if (i === 0) ctx.moveTo(xc, yc);
        else ctx.quadraticCurveTo(p0.x * canvas.width, p0.y * canvas.height, xc, yc);
      }
      ctx.stroke();
      // 合成モードを戻す
      ctx.globalCompositeOperation = "source-over";
    };

    // --- メイン描画ループ ---
    const render = () => {
      time += 0.04; // 基本スピード
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // === レイヤー1: 通常のモヤモヤ ===
      const pts = pointsRef.current;
      pts.forEach((p, i) => {
        const t = i / POINT_COUNT;
        // 現在のtargetTypeと標準スピード(time)で計算
        const target = calculateTargetPos(targetType, t, time);
        // 物理演算適用
        p.vx += (target.x - p.x) * 0.08; p.vy += (target.y - p.y) * 0.08;
        p.vx *= 0.8; p.vy *= 0.8; p.x += p.vx; p.y += p.vy;
      });
      drawSpline(pts, auraColor);

      // === レイヤー2: 紫の倍速モヤモヤ (PRESSED時のみ) ===
      if (phase === "PRESSED") {
        const purplePts = purplePointsRef.current;
        const fastTime = time * 2.5; // 倍速以上のスピードを設定

        purplePts.forEach((p, i) => {
          const t = i / POINT_COUNT;
          // 強制的に"BASE"タイプとし、倍速時間(fastTime)で計算
          const target = calculateTargetPos("BASE", t, fastTime);
          // 物理演算適用 (紫レイヤー用)
          p.vx += (target.x - p.x) * 0.08; p.vy += (target.y - p.y) * 0.08;
          p.vx *= 0.8; p.vy *= 0.8; p.x += p.vx; p.y += p.vy;
        });
        // 紫色で重ねて描画
        drawSpline(purplePts, PURPLE_AURA_COLOR);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetType, auraColor, phase]);

  return (
    <div 
      className="relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent"
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 背景イラスト層 */}
      <div 
        className={`absolute inset-0 transition-opacity duration-700 bg-contain bg-center bg-no-repeat ${isAssetsReady ? "opacity-100" : "opacity-90"}`}
        style={{ backgroundImage: `url(${phase === "PRESSED" ? "/handgoo.png" : phase === "LOADING" ? "/handopen.png" : "/handclose.png"})` }}
        onPointerDown={() => setPhase("PRESSED")}
        onPointerUp={() => setPhase("STANDBY")}
        onPointerLeave={() => setPhase("STANDBY")}
      />

      {/* 魂（モヤモヤ）層 */}
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={400} 
        // PRESSED時は scale-0.5 (BASEサイズ) に固定されるため、紫レイヤーも同じ大きさになる
        className={`absolute pointer-events-none opacity-80 transition-transform duration-700 ease-in-out ${
          targetType === "BASE" ? "scale-[0.5]" : "scale-[0.67]"
        }`} 
        style={{ left: "45.59%", top: "67.22%", transform: `translate(-50%, -50%) ${targetType === "BASE" ? "scale(0.5)" : "scale(0.67)"}` }}
      />

      {/* ネイル層 */}
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