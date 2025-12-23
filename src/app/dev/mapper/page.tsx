"use client";

import { useState } from "react";

export default function CoordinateMapper() {
  const [imagePath, setImagePath] = useState("/handopen.png");
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [rotation, setRotation] = useState(0); // 角度管理を追加

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x, y });
    console.log(`x: ${x.toFixed(2)}, y: ${y.toFixed(2)}, deg: ${rotation}`);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-sans">
      <h1 className="text-xl mb-4 font-bold">角度も測れる！座標取得ツール</h1>
      <div className="flex gap-4 mb-4">
        {["/handopen.png", "/handclose.png", "/handgoo.png"].map(path => (
          <button 
            key={path} 
            onClick={() => setImagePath(path)}
            className={`px-4 py-2 rounded font-bold transition-colors ${imagePath === path ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            {path}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div 
          className="relative inline-block border-2 border-red-500 cursor-crosshair bg-white shrink-0"
          onClick={handleClick}
        >
          <img src={imagePath} alt="mapper" className="max-w-full h-auto block" style={{ width: "450px" }} />
          
          {/* 爪に見立てた赤い長方形を表示 */}
          <div 
            className="absolute w-8 h-12 bg-red-500/50 border-2 border-red-700 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
            style={{ 
              left: `${coords.x}%`, 
              top: `${coords.y}%`,
              transform: `translate(-50%, -50%) rotate(${rotation}deg)` 
            }}
          >
            <div className="w-1 h-4 bg-white/80 rounded-full mb-4"></div> {/* 爪の向きを示すガイド */}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="bg-black p-6 rounded-lg border border-gray-700">
            <label className="block text-sm font-bold text-gray-400 mb-4">
              角度調整 (deg): <span className="text-blue-400 text-xl">{rotation}°</span>
            </label>
            <input 
              type="range" min="-180" max="180" value={rotation} 
              onChange={(e) => setRotation(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>-180°</span>
              <span>0° (垂直)</span>
              <span>180°</span>
            </div>
          </div>

          <div className="bg-black p-6 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">コピー用データ:</p>
            <code className="text-green-400 font-mono text-base block bg-gray-900 p-3 rounded">
              x: {coords.x.toFixed(2)}, y: {coords.y.toFixed(2)}, deg: {rotation}
            </code>
            <p className="text-xs text-gray-500 mt-4 leading-relaxed">
              【使い方】<br/>
              1. 爪の中心をクリック<br/>
              2. スライダーで爪の向きに合わせる<br/>
              3. 表示された数値を教えてください
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}