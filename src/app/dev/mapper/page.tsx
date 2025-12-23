"use client";

import { useState } from "react";

export default function CoordinateMapper() {
  const [imagePath, setImagePath] = useState("/handopen.jpg"); // 測定したい画像
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // クリック位置を0-100の相対座標に変換
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setCoords({ x, y });
    // コンソールにそのままコピーできる形式で出力
    console.log(`x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-xl mb-4">座標取得ツール</h1>
      <div className="flex gap-4 mb-4">
        {["/handopen.jpg", "/handclose.jpg", "/handgoo.jpg"].map(path => (
          <button 
            key={path} 
            onClick={() => setImagePath(path)}
            className={`px-4 py-2 rounded ${imagePath === path ? "bg-blue-600" : "bg-gray-700"}`}
          >
            {path}
          </button>
        ))}
      </div>

      <div 
        className="relative inline-block border-2 border-red-500 cursor-crosshair"
        onClick={handleClick}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagePath} alt="mapper" className="max-w-full h-auto block" style={{ width: "400px" }} />
        
        {/* クリックした場所に印を表示 */}
        <div 
          className="absolute w-2 h-2 bg-red-500 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
        />
      </div>

      <div className="mt-4 p-4 bg-black rounded">
        <p>最後にクリックした座標:</p>
        <code className="text-green-400">x: {coords.x.toFixed(2)}, y: {coords.y.toFixed(2)}</code>
      </div>
    </div>
  );
}