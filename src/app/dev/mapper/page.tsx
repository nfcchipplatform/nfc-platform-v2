"use client";

import { useState } from "react";

export default function CoordinateMapper() {
  // 拡張子を .png に変更
  const [imagePath, setImagePath] = useState("/handopen.png");
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCoords({ x, y });
    console.log(`x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-xl mb-4 font-bold">座標取得ツール（PNG版）</h1>
      <div className="flex gap-4 mb-4">
        {/* ボタンのリストも .png に変更 */}
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

      <div 
        className="relative inline-block border-2 border-red-500 cursor-crosshair bg-white"
        onClick={handleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={imagePath} 
          alt="Mapping target hand" 
          className="max-w-full h-auto block" 
          style={{ width: "400px" }} 
        />
        
        {/* クリック位置のマーカー */}
        <div 
          className="absolute w-3 h-3 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-[0_0_5px_rgba(255,255,255,0.8)]"
          style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
        />
      </div>

      <div className="mt-6 p-4 bg-black rounded-lg border border-gray-700">
        <p className="text-gray-400 text-sm mb-2">最後にクリックした座標:</p>
        <code className="text-green-400 font-mono text-lg">x: {coords.x.toFixed(2)}, y: {coords.y.toFixed(2)}</code>
        <p className="text-xs text-gray-500 mt-2">※画像をクリックして取得した数値をメモしてください。</p>
      </div>
    </div>
  );
}