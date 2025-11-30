// src/app/qr-test/page.tsx

"use client";

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function QRTestPage() {
  const [inputText, setInputText] = useState("https://example.com");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">QRコード生成テスト</h1>
        
        {/* QRコード表示エリア */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-4 mb-6 inline-block">
          {/* 
            QRCodeSVG を使用します。
            size: 大きさ
            level: 誤り訂正レベル (L, M, Q, H) - Hが高い
            includeMargin: 白い枠をつけるかどうか
          */}
          <QRCodeSVG 
            value={inputText} 
            size={200}
            level="H"
            includeMargin={true}
          />
        </div>

        {/* 入力エリア */}
        <div className="text-left">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            変換したい文字・URL
          </label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="ここにURLを入力"
          />
          <p className="text-xs text-gray-500 mt-2">
            文字を変更するとリアルタイムでQRが変わります。
          </p>
        </div>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-green-600 font-bold">
            ✅ この画面が表示されれば、ライブラリは正常に動作しています。
          </p>
        </div>
      </div>
    </div>
  );
}