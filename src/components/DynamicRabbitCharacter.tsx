// src/components/DynamicRabbitCharacter.tsx

import React from 'react';

interface DynamicRabbitCharacterProps {
  earLength: number; // P1: 親指の長さ
  armLength: number; // P2: 人差し指・小指（外側の指）の長さ
  legLength: number; // P3: 中指・薬指（内側の指）の長さ
  bodySize: number;  // P4: 手のひら（胴体）の大きさ
}

const DynamicRabbitCharacter: React.FC<DynamicRabbitCharacterProps> = ({
  earLength,
  armLength,
  legLength,
  bodySize,
}) => {
  // --- パラメーターの正規化 ---
  // 入力値 1～5 を、描画用のスケール係数に変換
  const baseParam = 3.0;
  const getFactor = (val: number, sensitivity: number = 1.0) => {
    const normalized = val / baseParam;
    // 基準1.0倍を中心に、sensitivityの強度で増減させる
    return 1.0 + (normalized - 1.0) * sensitivity;
  };

  // 各パーツへのパラメーター割り当て
  // P1: 親指 (旧:耳) -> 感度高め
  const pThumb = getFactor(earLength, 1.0);
  
  // P2: 外側の指 (旧:手) -> 人差し指と小指
  const pOuterFinger = getFactor(armLength, 1.0); 
  
  // P3: 内側の指 (旧:足) -> 中指と薬指
  const pInnerFinger = getFactor(legLength, 1.0); 
  
  // P4: 胴体 (旧:胴体) -> 手のひら全体
  const pBody = getFactor(bodySize, 0.6);

  // --- スタイル定数 ---
  const STROKE_WIDTH = 6; // 線を少し太くしてポップに
  const FILL_COLOR = 'white';
  const STROKE_COLOR = 'black';
  
  const COMMON_STYLE: React.SVGAttributes<SVGElement> = {
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round', // 端っこを丸く
    strokeLinejoin: 'round',
  };

  // --- 座標計算 (Canvasサイズ: 240x360) ---
  const viewBoxHeight = 360;
  const centerX = 120;
  const centerY = 160; // 重心を少し上に

  // 1. 胴体（手のひら）
  // 卵型に近い円形
  const palmRx = 70 * pBody; // 横幅半径
  const palmRy = 80 * pBody; // 縦幅半径
  const palmTopY = centerY - palmRy;
  const palmBottomY = centerY + palmRy;

  // 2. 親指 (Thumb) - 向かって左上から生える
  // 角度をつけて配置
  const thumbBaseX = centerX - palmRx * 0.8;
  const thumbBaseY = centerY - palmRy * 0.4;
  const thumbLen = 50 * pThumb;
  const thumbWidth = 25 * pBody; // 親指の太さは胴体に連動

  const thumbPath = `
    M ${thumbBaseX} ${thumbBaseY}
    Q ${thumbBaseX - thumbLen} ${thumbBaseY - thumbLen * 0.5} ${thumbBaseX - thumbLen - 10} ${thumbBaseY - thumbLen}
    A ${thumbWidth/2} ${thumbWidth/2} 0 0 1 ${thumbBaseX - thumbLen + 15} ${thumbBaseY - thumbLen - 15}
    Q ${thumbBaseX - thumbLen * 0.2} ${thumbBaseY - thumbLen} ${thumbBaseX + 10} ${thumbBaseY - 20}
    L ${thumbBaseX} ${thumbBaseY}
    Z
  `;

  // 3. 4本の指（足）
  // 胴体の下部曲線に沿って配置
  // 指の幅
  const fingerWidth = 20 * pBody; 
  // 指の間隔
  const spacing = fingerWidth * 1.2;

  // 各指の長さ計算 (付け根からの長さ)
  const lenIndex = 40 * pOuterFinger;  // 人差し指 (左外)
  const lenMiddle = 50 * pInnerFinger; // 中指 (左内)
  const lenRing = 50 * pInnerFinger;   // 薬指 (右内)
  const lenLittle = 35 * pOuterFinger; // 小指 (右外)

  // 指のX座標 (中心から左右に展開)
  const xMiddle = centerX - spacing * 0.5;
  const xRing = centerX + spacing * 0.5;
  const xIndex = centerX - spacing * 1.5;
  const xLittle = centerX + spacing * 1.5;

  // 指の付け根Y座標 (楕円の方程式から簡易的に算出、あるいは固定オフセット)
  // ここではシンプルに胴体の下部付近を基準にする
  const fingerBaseY = centerY + palmRy * 0.8;

  // 指生成ヘルパー関数 (棒状のパス)
  const createFingerPath = (x: number, y: number, length: number, width: number, angleDeg: number) => {
    // 角度に応じた先端位置の計算
    const rad = (angleDeg * Math.PI) / 180;
    const tipX = x + length * Math.sin(rad);
    const tipY = y + length * Math.cos(rad);
    
    // シンプルな線分（太線）として描画
    return `M ${x} ${y} L ${tipX} ${tipY}`;
  };

  // 4本の指のパス (少し放射状に広げる)
  const pathIndex = createFingerPath(xIndex, fingerBaseY - 10, lenIndex, fingerWidth, -15);
  const pathMiddle = createFingerPath(xMiddle, fingerBaseY, lenMiddle, fingerWidth, -5);
  const pathRing = createFingerPath(xRing, fingerBaseY, lenRing, fingerWidth, 5);
  const pathLittle = createFingerPath(xLittle, fingerBaseY - 10, lenLittle, fingerWidth, 15);

  // 4. 顔パーツ
  // 手のひらの中央より少し上に配置
  const faceY = centerY - 10;
  const eyeOffsetX = 20 * pBody;
  const eyeSize = 6;

  return (
    <svg
      width="240"
      height={viewBoxHeight}
      viewBox={`0 0 240 ${viewBoxHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      className="character-svg animate-sway" 
      style={{ overflow: 'visible' }}
    >
      {/* --- 描画レイヤー順序 --- */}

      {/* 1. 親指 (胴体の後ろ) */}
      <path d={thumbPath} {...COMMON_STYLE} />

      {/* 2. 4本の指 (足) - 太いストロークで描画 */}
      {/* 指先を丸く表現するため strokeLinecap="round" を利用 */}
      <path d={pathIndex} {...COMMON_STYLE} strokeWidth={fingerWidth} />
      <path d={pathMiddle} {...COMMON_STYLE} strokeWidth={fingerWidth} />
      <path d={pathRing} {...COMMON_STYLE} strokeWidth={fingerWidth} />
      <path d={pathLittle} {...COMMON_STYLE} strokeWidth={fingerWidth} />

      {/* 3. 胴体 (手のひら) - メイン */}
      <ellipse cx={centerX} cy={centerY} rx={palmRx} ry={palmRy} {...COMMON_STYLE} />

      {/* 4. 顔 */}
      {/* 目 */}
      <circle cx={centerX - eyeOffsetX} cy={faceY} r={eyeSize} fill={STROKE_COLOR} />
      <circle cx={centerX + eyeOffsetX} cy={faceY} r={eyeSize} fill={STROKE_COLOR} />
      {/* 口 (小さなカーブ) */}
      <path
        d={`M ${centerX - 5} ${faceY + 10} Q ${centerX} ${faceY + 15}, ${centerX + 5} ${faceY + 10}`}
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default DynamicRabbitCharacter;