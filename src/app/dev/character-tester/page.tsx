// src/app/dev/character-tester/page.tsx

'use client';

import React, { useState } from 'react';
import DynamicRabbitCharacter from '@/components/DynamicRabbitCharacter'; // パスは環境に合わせて調整してください

/**
 * キャラクター生成モジュール DynamicRabbitCharacter のテスト用UI
 */
const CharacterTesterPage: React.FC = () => {
  // 初期値 P5555
  const [earLength, setEarLength] = useState(5); // P1
  const [armLength, setArmLength] = useState(5); // P2
  const [legLength, setLegLength] = useState(5); // P3
  const [bodySize, setBodySize] = useState(5);   // P4

  const paramString = `${earLength}${armLength}${legLength}${bodySize}`;

  const sliderProps = [
    { label: 'P1: 耳の長さ (earLength)', value: earLength, setter: setEarLength },
    { label: 'P2: 手の長さ (armLength)', value: armLength, setter: setArmLength },
    { label: 'P3: 足の長さ (legLength)', value: legLength, setter: setLegLength },
    { label: 'P4: 胴体の大きさ (bodySize)', value: bodySize, setter: setBodySize },
  ];

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-center">🐰 キャラクター生成機能 テスター</h1>
      <p className="text-center text-xl mb-8">現在のパラメーター: <span className="font-mono text-red-600">{paramString}</span></p>

      <div className="flex flex-col md:flex-row gap-10 max-w-5xl mx-auto">
        
        {/* 1. キャラクター表示エリア */}
        <div className="flex-shrink-0 w-full md:w-1/2 p-4 bg-white shadow-xl rounded-lg flex justify-center items-center min-h-[400px]">
          <DynamicRabbitCharacter
            earLength={earLength}
            armLength={armLength}
            legLength={legLength}
            bodySize={bodySize}
          />
        </div>

        {/* 2. パラメーター操作エリア */}
        <div className="w-full md:w-1/2 p-6 bg-white shadow-lg rounded-lg space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">形状パラメーター (1〜5)</h2>
          
          {sliderProps.map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-lg font-medium mb-1">
                {label}: <span className="font-bold text-blue-600">{value}</span>
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={value}
                onChange={(e) => setter(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-lg"
              />
            </div>
          ))}

          <div className="mt-8 pt-4 border-t">
            <h3 className="text-xl font-semibold">アニメーション確認</h3>
            <p className="text-gray-600">キャラクターが常時、左右にわずかに揺れていることを確認してください。（`animate-sway`適用）</p>
            <p className="text-gray-600">スタイルは、白地のウサギの線画で、ピンク色の装飾がないことを確認してください。</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CharacterTesterPage;