"use client";

import React, { useState } from 'react';
import DynamicRabbitCharacter from '@/components/DynamicRabbitCharacter';

export default function CharacterTesterPage() {
  // 新しいパラメーター (P1〜P7) の状態管理
  const [thumbLength, setThumbLength] = useState<number>(3);  // P1: 親指 (初期値を3に変更)
  const [indexLength, setIndexLength] = useState<number>(3);  // P2: 人差し指 (初期値を3に変更)
  const [middleLength, setMiddleLength] = useState<number>(3);// P3: 中指 (初期値を3に変更)
  const [ringLength, setRingLength] = useState<number>(3);    // P4: 薬指 (初期値を3に変更)
  const [littleLength, setLittleLength] = useState<number>(3);// P5: 小指 (初期値を3に変更)
  const [bodySize, setBodySize] = useState<number>(3);        // P6: 胴体 (初期値を3に変更)
  const [emotionType, setEmotionType] = useState<number>(3);  // P7: 表情 (初期値を3に変更)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">キャラクター形状テスター (テノヒラくん Ver.)</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* 左側: キャラクター表示エリア */}
          <div className="flex-shrink-0 w-full md:w-1/2 p-4 bg-white shadow-xl rounded-lg flex justify-center items-center min-h-[500px]">
            <DynamicRabbitCharacter 
              thumbLength={thumbLength}
              indexLength={indexLength}
              middleLength={middleLength}
              ringLength={ringLength}
              littleLength={littleLength}
              bodySize={bodySize}
              emotionType={emotionType}
            />
          </div>

          {/* 右側: コントロールパネル */}
          <div className="w-full md:w-1/2 bg-white p-6 shadow-lg rounded-lg overflow-y-auto max-h-[800px]">
            <h2 className="text-xl font-bold mb-4 text-gray-700">形状パラメーター (1〜5)</h2>
            <div className="space-y-6">
              
              {/* P1: 親指 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P1: 親指の長さ (thumbLength): <span className="text-blue-600 font-bold">{thumbLength.toFixed(1)}</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={thumbLength} 
                  onChange={(e) => setThumbLength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* P2: 人差し指 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P2: 人差し指の長さ (indexLength): <span className="text-blue-600 font-bold">{indexLength.toFixed(1)}</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={indexLength} 
                  onChange={(e) => setIndexLength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* P3: 中指 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P3: 中指の長さ (middleLength): <span className="text-blue-600 font-bold">{middleLength.toFixed(1)}</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={middleLength} 
                  onChange={(e) => setMiddleLength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* P4: 薬指 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P4: 薬指の長さ (ringLength): <span className="text-blue-600 font-bold">{ringLength.toFixed(1)}</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={ringLength} 
                  onChange={(e) => setRingLength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* P5: 小指 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P5: 小指の長さ (littleLength): <span className="text-blue-600 font-bold">{littleLength.toFixed(1)}</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={littleLength} 
                  onChange={(e) => setLittleLength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* P6: 胴体 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  P6: 胴体の大きさ (bodySize): <span className="text-blue-600 font-bold">{bodySize.toFixed(1)}</span>
                </label>
                <input 
                  type="range" min="1" max="5" step="0.1" 
                  value={bodySize} 
                  onChange={(e) => setBodySize(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* P7: 表情 */}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  P7: 表情 (emotionType): <span className="text-purple-600 font-bold">{Math.round(emotionType)}</span>
                </label>
                <div className="flex justify-between text-xs text-gray-500 mb-1 px-1">
                  <span>1:喜</span>
                  <span>2:怒</span>
                  <span>3:哀</span>
                  <span>4:楽</span>
                  <span>5:眠</span>
                </div>
                <input 
                  type="range" min="1" max="5" step="1" 
                  value={emotionType} 
                  onChange={(e) => setEmotionType(parseInt(e.target.value))}
                  className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-xs text-gray-500 mt-2">
                  現在の表情: <span className="font-bold text-gray-800">
                    {Math.round(emotionType) === 1 && "喜び (Happy)"}
                    {Math.round(emotionType) === 2 && "怒り (Angry)"}
                    {Math.round(emotionType) === 3 && "哀しみ (Sad)"}
                    {Math.round(emotionType) === 4 && "楽しい (Relax)"}
                    {Math.round(emotionType) === 5 && "睡眠 (Sleep)"}
                  </span>
                </p>
              </div>

            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded text-sm text-gray-600">
              <h3 className="font-bold mb-2">アニメーション確認</h3>
              <p>キャラクターが常時、左右にわずかに揺れていることを確認してください。(`animate-sway`適用)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}