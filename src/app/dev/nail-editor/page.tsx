"use client";

import { useState } from "react";

// 初期値（前回の座標データをベースに設定）
const INITIAL_CONFIG = [
  { id: "thumb",  name: "親指", x: 54.06, y: 63.36, w: 12.5, h: 16.5, r: -124, br: "45% 45% 20% 20%" },
  { id: "index",  name: "人差", x: 56.27, y: 51.23, w: 12.5, h: 16.5, r: 161, br: "45% 45% 20% 20%" },
  { id: "middle", name: "中指", x: 44.79, y: 53.38, w: 12.5, h: 16.5, r: 167, br: "45% 45% 20% 20%" },
  { id: "ring",   name: "薬指", x: 33.76, y: 55.04, w: 12.5, h: 16.5, r: 167, br: "45% 45% 20% 20%" },
  { id: "pinky",  name: "小指", x: 25.15, y: 54.71, w: 12.5, h: 16.5, r: 159, br: "45% 45% 20% 20%" },
];

export default function NailEditor() {
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [selectedIndex, setSelectedIndex] = useState(0); // 親指(Index 0)を初期選択に
  const [imagePath, setImagePath] = useState("/handgoo.png"); // 初期の下絵をhandgooに変更

  const updateVal = (key: string, val: any) => {
    const newConfig = [...config];
    newConfig[selectedIndex] = { ...newConfig[selectedIndex], [key]: val };
    setConfig(newConfig);
  };

  const current = config[selectedIndex];

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white font-sans flex flex-col md:flex-row gap-8">
      
      {/* 左側：プレビュー */}
      <div className="relative shrink-0 bg-white border-4 border-blue-500 rounded-lg overflow-hidden" style={{ width: "450px", height: "600px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imagePath} alt="Hand" className="absolute inset-0 w-full h-full object-contain opacity-40" />
        
        {config.map((n, i) => (
          <div key={n.id} 
            className={`absolute border-2 ${i === selectedIndex ? "border-red-500 z-50 scale-105 shadow-[0_0_15px_rgba(255,0,0,0.5)]" : "border-blue-300 opacity-30"}`}
            style={{
              left: `${n.x}%`, top: `${n.y}%`,
              width: `${n.w}%`, height: `${n.h}%`,
              transform: `translate(-50%, -50%) rotate(${n.r}deg)`,
              borderRadius: n.br,
              background: i === selectedIndex ? "rgba(255,0,0,0.2)" : "rgba(0,0,255,0.1)"
            }}
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {/* 右側：コントロールパネル */}
      <div className="flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold italic">Nail Shape Editor</h1>
          <div className="flex gap-2">
             <button onClick={() => setImagePath("/handclose.png")} className={`text-[10px] px-2 py-1 rounded ${imagePath === "/handclose.png" ? "bg-blue-600" : "bg-gray-700"}`}>CloseView</button>
             <button onClick={() => setImagePath("/handgoo.png")} className={`text-[10px] px-2 py-1 rounded ${imagePath === "/handgoo.png" ? "bg-blue-600" : "bg-gray-700"}`}>GooView</button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {config.map((n, i) => (
            <button key={n.id} onClick={() => setSelectedIndex(i)} 
              className={`px-4 py-2 rounded font-bold transition-all ${i === selectedIndex ? "bg-red-600 scale-105 shadow-lg" : "bg-gray-700 hover:bg-gray-600"}`}>
              {n.name}
            </button>
          ))}
        </div>

        <div className="bg-gray-800 p-6 rounded-xl space-y-4 shadow-inner border border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-black mb-1">Width: {current.w}%</label>
              <input type="range" min="5" max="25" step="0.1" value={current.w} onChange={e => updateVal("w", parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-black mb-1">Height: {current.h}%</label>
              <input type="range" min="5" max="30" step="0.1" value={current.h} onChange={e => updateVal("h", parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase font-black mb-1">Rotation: {current.r}deg</label>
            <input type="range" min="-180" max="180" value={current.r} onChange={e => updateVal("r", parseInt(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-700">
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-black mb-1">Pos X: {current.x}%</label>
              <input type="range" min="0" max="100" step="0.01" value={current.x} onChange={e => updateVal("x", parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-black mb-1">Pos Y: {current.y}%</label>
              <input type="range" min="0" max="100" step="0.01" value={current.y} onChange={e => updateVal("y", parseFloat(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 uppercase font-black mb-1">Shape (Corner Radius)</label>
            <select value={current.br} onChange={e => updateVal("br", e.target.value)} className="w-full bg-gray-900 border border-gray-600 p-2 rounded text-xs font-mono">
              <option value="45% 45% 20% 20%">Natural (U-Shape)</option>
              <option value="50% 50% 0 0">Square Off</option>
              <option value="50% 50% 50% 50%">Oval</option>
              <option value="10% 10% 10% 10%">Square</option>
              <option value="50% 50% 20% 20% / 80% 80% 20% 20%">Pointy</option>
            </select>
          </div>
        </div>

        <div className="bg-black p-4 rounded border border-gray-700">
          <p className="text-blue-400 text-[10px] mb-2 uppercase font-black tracking-widest">Live JSON Data</p>
          <pre className="text-green-400 text-[10px] overflow-x-auto whitespace-pre-wrap font-mono leading-tight bg-gray-950 p-2 rounded">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}