"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import Image from "next/image";
import { POINT_COUNT, AURA_COLORS, PURPLE_AURA_COLOR, SHAPE_LIBRARY, NAIL_CONFIG } from "@/constants/soulData";

interface ProfileSummary { 
  id: string; 
  username: string | null; 
  name: string | null; 
  image: string | null; 
}

export default function SoulImageTestPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [targetType, setTargetType] = useState<string>("BASE");
  const [auraColor, setAuraColor] = useState(AURA_COLORS[0]);
  const [isExploding, setIsExploding] = useState(false);
  const [phase, setPhase] = useState<"LOADING" | "STANDBY" | "PRESSED">("LOADING");
  const [isAssetsReady, setIsAssetsReady] = useState(false);
  
  // 画像URLの状態
  const [imageUrl, setImageUrl] = useState<string>("");
  const [showImage, setShowImage] = useState<boolean>(false);
  
  // テスト用のスロットデータ（5本の指に対応）
  const [slots, setSlots] = useState<(ProfileSummary | null)[]>([
    { id: "1", username: "thumb", name: "親指", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop" },
    { id: "2", username: "index", name: "人差し指", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop" },
    { id: "3", username: "middle", name: "中指", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop" },
    { id: "4", username: "ring", name: "薬指", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop" },
    { id: "5", username: "pinky", name: "小指", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop" },
  ]);

  const pointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const purplePointsRef = useRef(Array.from({ length: POINT_COUNT }, () => ({ x: 0.5, y: 0.5, vx: 0, vy: 0 })));
  const phaseRef = useRef(phase);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // アセットの読み込み（簡略版：すぐにSTANDBYに移行）
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAssetsReady(true);
      setPhase("STANDBY");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 指を閉じる/開く処理
  const handlePointerDown = useCallback(() => setPhase("PRESSED"), []);
  const handlePointerUp = useCallback(() => setPhase("STANDBY"), []);

  // 手の画像URLをメモ化
  const handImageSrc = useMemo(() => {
    if (phase === "PRESSED") return "/handgoo.png";
    if (phase === "LOADING") return "/handopen.png";
    return "/handclose.png";
  }, [phase]);

  // ネイルチップの最適化されたURLをメモ化
  const nailConfigs = useMemo(() => {
    return NAIL_CONFIG.map((config, index) => {
      const user = slots[index];
      const optimizedImageUrl = user?.image?.startsWith('http') 
        ? `${user.image}?f_auto,q_auto,w_400,dpr_auto` 
        : user?.image;
      return { config, user, optimizedImageUrl };
    });
  }, [slots]);

  // 画像を読み込む
  useEffect(() => {
    if (!imageUrl) {
      imageRef.current = null;
      return;
    }
    
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
    };
    img.onerror = () => {
      console.error("Failed to load image");
      imageRef.current = null;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const triggerExplosion = () => {
    if (targetType === "BASE" || isExploding) return;
    setIsExploding(true);
    setTimeout(() => {
      setIsExploding(false);
      setTargetType("BASE");
    }, 1500);
  };

  // 形状の自動切り替え（既存のロジックと同じ）
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

  // メインのアニメーションループ（既存のロジックと同じ）
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
        const currentType = layer === 1 ? "BASE" : targetType;
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
            let r = 0.14;
            for (let j = 1; j <= 4; j++) {
              r += Math.sin((i/POINT_COUNT) * Math.PI * (38 * j * 0.5) + currentTime * j) * (0.05 / j);
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
        if (showImage && imageRef.current && layer === 0) {
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
  }, [targetType, auraColor, phase, isExploding, showImage, imageUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 text-gray-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-purple-600">魂の線の中に画像を表示する検証</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左側：手の表示エリア（InteractiveHandと同じ構造 - 本番環境と同じ） */}
          <div className="flex-shrink-0 flex flex-col items-center">
            {/* 本番環境と同じサイズとレイアウト */}
            <div className="relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent"
              style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
              onContextMenu={(e) => e.preventDefault()}>
              
              {/* 1. 背景イラスト層（手の画像） */}
              <div className="absolute inset-0" onPointerDown={handlePointerDown} onPointerUp={handlePointerUp} onPointerLeave={handlePointerUp}>
                <Image
                  src={handImageSrc}
                  alt="Hand illustration"
                  fill
                  className="object-contain opacity-100"
                  priority
                  quality={100}
                  sizes="(max-width: 450px) 100vw, 450px"
                />
              </div>

              {/* 2. 魂（もやもや）層 */}
              {isAssetsReady && (
                <canvas 
                  ref={canvasRef} 
                  width={400} 
                  height={400} 
                  onClick={triggerExplosion}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp} 
                  className={`absolute pointer-events-auto transition-all duration-1000 ease-in-out ${
                    isExploding ? "opacity-0 -translate-y-[200px] scale-[1.5]" : "opacity-80"
                  } ${targetType === "BASE" ? "scale-[0.5]" : "scale-[0.67] cursor-pointer"}`} 
                  style={{ 
                    left: "45.59%", 
                    top: "67.22%", 
                    transform: `translate(-50%, -50%) ${targetType === "BASE" ? "scale(0.5)" : "scale(0.67)"}`,
                    touchAction: "none"
                  }} 
                />
              )}

              {/* 3. ネイルチップ層 */}
              {nailConfigs.map(({ config, user, optimizedImageUrl }) => {
                if (!user) return null;
                // handgoo（PRESSED）の時：5本すべて表示、handclose（STANDBY）の時：親指以外の4本のみ表示
                const isVisible = phase === "PRESSED" 
                  ? true // handgooの時は5本すべて表示
                  : phase === "STANDBY" && config.id !== "thumb"; // handcloseの時は親指以外の4本のみ表示
                
                return (
                  <div key={config.id}
                    className={`absolute block border-2 border-black overflow-hidden group active:scale-95 transition-all duration-400 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                    style={{ 
                      left: `${config.x}%`, top: `${config.y}%`, width: `${config.w}%`, height: `${config.h}%`, 
                      transform: `translate(-50%, -50%) rotate(${config.r}deg)`, 
                      zIndex: config.id === "thumb" ? 50 : 40, 
                      borderRadius: config.br,
                      WebkitTouchCallout: 'none' 
                    }}
                    onContextMenu={(e) => e.preventDefault()}>
                    {optimizedImageUrl && (
                      <Image
                        src={optimizedImageUrl}
                        alt={user.name || ""}
                        fill
                        className="object-cover"
                        sizes="(max-width: 450px) 8vw, 8vw"
                        loading="lazy"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-sm text-cyan-300 text-center">
              <p>現在の形状: <span className="font-bold">{targetType}</span></p>
              <p>フェーズ: <span className="font-bold">{phase}</span></p>
              {isExploding && <p className="text-yellow-400">爆発中...</p>}
            </div>
          </div>

          {/* 右側：コントロールパネル */}
          <div className="flex-1 space-y-6">
            {/* 形状選択 */}
            <section className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-cyan-400">形状選択</h2>
              <div className="grid grid-cols-2 gap-2">
                {["BASE", "CIRCLE", "TRIANGLE", "SQUARE", "STAR"].map((shape) => (
                  <button
                    key={shape}
                    onClick={() => setTargetType(shape)}
                    className={`py-2 px-4 rounded transition-colors ${
                      targetType === shape
                        ? "bg-cyan-500 text-black font-bold"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </section>

            {/* 画像設定 */}
            <section className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-cyan-400">画像設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">画像URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded text-white"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    CloudinaryのURLや外部画像URLを入力してください
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showImage}
                      onChange={(e) => setShowImage(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <span>画像を表示する</span>
                  </label>
                </div>
                {/* サンプル画像ボタン */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setImageUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop");
                      setShowImage(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                  >
                    サンプル画像1
                  </button>
                  <button
                    onClick={() => {
                      setImageUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop");
                      setShowImage(true);
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
                  >
                    サンプル画像2
                  </button>
                </div>
              </div>
            </section>

            {/* 色設定 */}
            <section className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-cyan-400">色設定</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">魂の色</label>
                  <input
                    type="color"
                    value={auraColor}
                    onChange={(e) => setAuraColor(e.target.value)}
                    className="w-full h-10 bg-transparent border border-slate-600 rounded cursor-pointer"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {AURA_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setAuraColor(color)}
                      className="w-10 h-10 rounded border-2 border-slate-600"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ネイル画像設定 */}
            <section className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-cyan-400">ネイル画像設定</h2>
              <div className="space-y-3">
                {NAIL_CONFIG.map((config, index) => {
                  const user = slots[index];
                  return (
                    <div key={config.id} className="flex items-center gap-3">
                      <label className="text-sm w-20">{config.id}</label>
                      <input
                        type="text"
                        value={user?.image || ""}
                        onChange={(e) => {
                          const newSlots = [...slots];
                          if (newSlots[index]) {
                            newSlots[index] = { ...newSlots[index]!, image: e.target.value };
                          } else {
                            newSlots[index] = { id: String(index), username: config.id, name: config.id, image: e.target.value };
                          }
                          setSlots(newSlots);
                        }}
                        placeholder="画像URL"
                        className="flex-1 px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm"
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 操作説明 */}
            <section className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <h2 className="text-lg font-bold mb-4 text-cyan-400">操作説明</h2>
              <ul className="space-y-2 text-sm text-slate-300">
                <li>• 手の部分をタップ/長押し: handclose → handgoo に切り替え</li>
                <li>• 魂をクリック: 爆発アニメーション（形状がBASE以外の時）</li>
                <li>• 形状は10秒ごとに自動切り替え</li>
                <li>• handgoo時: 5本すべてのネイル表示</li>
                <li>• handclose時: 親指以外の4本のネイル表示</li>
                <li>• 画像は魂の線で囲まれた領域のみ表示されます</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

