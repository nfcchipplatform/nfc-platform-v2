// src/components/DynamicRabbitCharacter.tsx

import React from 'react';

/**
 * P1～P7 のパラメーター定義
 * すべて 1(最小) ～ 5(最大) の範囲を想定
 */
interface DynamicRabbitCharacterProps {
  thumbLength: number;   // P1: 親指の長さ
  indexLength: number;   // P2: 人差し指の長さ
  middleLength: number;  // P3: 中指の長さ
  ringLength: number;    // P4: 薬指の長さ
  littleLength: number;  // P5: 小指の長さ
  bodySize: number;      // P6: 胴体（手のひら）の大きさ
  emotionType: number;   // P7: 表情 (1:喜, 2:怒, 3:哀, 4:楽, 5:睡眠)
}

const DynamicRabbitCharacter: React.FC<DynamicRabbitCharacterProps> = ({
  thumbLength,
  indexLength,
  middleLength,
  ringLength,
  littleLength,
  bodySize,
  emotionType,
}) => {
  // --- 1. パラメーターの正規化係数計算 ---
  const baseParam = 3.0;
  // 各指の長さを計算するヘルパー (感度1.2倍で変化をわかりやすく)
  const getFingerFactor = (val: number) => {
    const normalized = val / baseParam;
    return 1.0 + (normalized - 1.0) * 1.2;
  };

  // 各パーツのスケール係数
  const fThumb = getFingerFactor(thumbLength);
  const fIndex = getFingerFactor(indexLength);
  const fMiddle = getFingerFactor(middleLength);
  const fRing = getFingerFactor(ringLength);
  const fLittle = getFingerFactor(littleLength);
  
  // 胴体は極端に変わりすぎないよう感度を抑える
  const fBody = 1.0 + (bodySize / baseParam - 1.0) * 0.5;

  // --- 2. 共通スタイル定義 ---
  const STROKE_WIDTH = 6;
  const FILL_COLOR = 'white';
  const STROKE_COLOR = 'black';
  
  const COMMON_STYLE: React.SVGAttributes<SVGElement> = {
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  // --- 3. 座標・形状計算 ---
  // ViewBox: 300x400 (指が伸びても収まるように縦長に)
  const viewBoxW = 300;
  const viewBoxH = 400;
  const centerX = viewBoxW / 2;
  const centerY = viewBoxH * 0.65; // 重心を少し下げる

  // 手のひら（胴体）のサイズ
  const palmRx = 75 * fBody;
  const palmRy = 85 * fBody;

  // 指を描画する関数 (角度、長さ、幅を指定)
  const createFingerPath = (angleDeg: number, factor: number, widthBase: number) => {
    const angleRad = (angleDeg - 90) * (Math.PI / 180); // -90で真上を0度に
    const length = 70 * factor; // 基本長さ70 * 係数
    const width = widthBase * fBody;

    // 指の根本（手のひらの輪郭上）
    const startX = centerX + palmRx * Math.cos(angleRad);
    const startY = centerY + palmRy * Math.sin(angleRad);

    // 指の先端
    const tipX = centerX + (palmRx + length) * Math.cos(angleRad);
    const tipY = centerY + (palmRy + length) * Math.sin(angleRad);

    // 単純な線ではなく、太さを持った「U字型」のパスを生成して接続を綺麗にする
    // (ここでは strokeWidth を太くして線で表現する簡易実装を採用し、レイヤー順序で制御します)
    return {
      d: `M ${startX} ${startY} L ${tipX} ${tipY}`,
      width: width
    };
  };

  // 各指の定義 (角度は時計回り、真上が0度だと仮定するがSVG座標系では調整が必要)
  // ここでは配置バランスを調整
  // 親指: 左側面 (-50度くらい)
  const p1 = createFingerPath(-50, fThumb, 28);
  // 人差し指: 左上 (-20度)
  const p2 = createFingerPath(-20, fIndex, 24);
  // 中指: 真上 (0度)
  const p3 = createFingerPath(0, fMiddle, 24);
  // 薬指: 右上 (20度)
  const p4 = createFingerPath(20, fRing, 22);
  // 小指: 右側面 (45度)
  const p5 = createFingerPath(45, fLittle, 20);


  // --- 4. 表情のレンダリング (P7) ---
  const renderFace = () => {
    // 1:喜, 2:怒, 3:哀, 4:楽, 5:睡眠
    // 範囲外の値が来たら「4:楽(通常)」として扱う
    const mode = Math.min(5, Math.max(1, emotionType));
    
    const faceY = centerY - 10 * fBody; // 顔の中心Y
    const eyeSpace = 25 * fBody; // 目の間隔

    // 共通パーツ
    const leftEyeX = centerX - eyeSpace;
    const rightEyeX = centerX + eyeSpace;

    switch (mode) {
      case 1: // 【喜】 笑った目、大きな口
        return (
          <g>
            {/* 目: ^ ^ */}
            <path d={`M ${leftEyeX - 10} ${faceY} L ${leftEyeX} ${faceY - 10} L ${leftEyeX + 10} ${faceY}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} strokeLinecap="round" />
            <path d={`M ${rightEyeX - 10} ${faceY} L ${rightEyeX} ${faceY - 10} L ${rightEyeX + 10} ${faceY}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} strokeLinecap="round" />
            {/* 口: 大きなD型 */}
            <path d={`M ${centerX - 20} ${faceY + 20} Q ${centerX} ${faceY + 50}, ${centerX + 20} ${faceY + 20} Z`} fill={STROKE_COLOR} stroke="none" />
          </g>
        );

      case 2: // 【怒】 つり目、への字口、漫符
        return (
          <g>
             {/* 眉/目: \ /  */}
            <path d={`M ${leftEyeX - 10} ${faceY - 15} L ${leftEyeX + 10} ${faceY}`} fill="none" stroke={STROKE_COLOR} strokeWidth={5} />
            <path d={`M ${rightEyeX + 10} ${faceY - 15} L ${rightEyeX - 10} ${faceY}`} fill="none" stroke={STROKE_COLOR} strokeWidth={5} />
            {/* 黒目 */}
            <circle cx={leftEyeX} cy={faceY} r={3} fill={STROKE_COLOR} />
            <circle cx={rightEyeX} cy={faceY} r={3} fill={STROKE_COLOR} />
            {/* 口: への字 */}
            <path d={`M ${centerX - 15} ${faceY + 35} Q ${centerX} ${faceY + 15}, ${centerX + 15} ${faceY + 35}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} strokeLinecap="round" />
            {/* 怒りマーク */}
            <path d={`M ${centerX + 50} ${faceY - 40} L ${centerX + 60} ${faceY - 50} M ${centerX + 60} ${faceY - 40} L ${centerX + 50} ${faceY - 50}`} stroke={STROKE_COLOR} strokeWidth={3} />
          </g>
        );

      case 3: // 【哀】 涙、困り眉、波線口
        return (
          <g>
            {/* 目: / \ (困り) */}
            <path d={`M ${leftEyeX - 10} ${faceY} L ${leftEyeX + 10} ${faceY - 5}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} />
            <path d={`M ${rightEyeX + 10} ${faceY} L ${rightEyeX - 10} ${faceY - 5}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} />
             {/* 涙 */}
            <path d={`M ${leftEyeX} ${faceY + 10} Q ${leftEyeX - 5} ${faceY + 25}, ${leftEyeX} ${faceY + 30} Q ${leftEyeX + 5} ${faceY + 25}, ${leftEyeX} ${faceY + 10}`} fill="skyblue" stroke="none" />
            {/* 口: 波線 */}
            <path d={`M ${centerX - 15} ${faceY + 30} Q ${centerX - 5} ${faceY + 20}, ${centerX} ${faceY + 30} Q ${centerX + 5} ${faceY + 40}, ${centerX + 15} ${faceY + 30}`} fill="none" stroke={STROKE_COLOR} strokeWidth={3} strokeLinecap="round" />
          </g>
        );
      
      case 5: // 【睡眠】 閉じた目、Zzz
        return (
          <g>
            {/* 目: 一本線 (閉じてる) */}
            <path d={`M ${leftEyeX - 10} ${faceY} L ${leftEyeX + 10} ${faceY}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} />
            <path d={`M ${rightEyeX - 10} ${faceY} L ${rightEyeX + 10} ${faceY}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} />
            {/* 口: 小さい丸 (寝息) */}
            <circle cx={centerX} cy={faceY + 30} r={5} fill="none" stroke={STROKE_COLOR} strokeWidth={3} />
            {/* Zzz */}
            <text x={centerX + 40} y={faceY - 20} fontFamily="sans-serif" fontSize="24" fontWeight="bold" fill={STROKE_COLOR}>Zzz</text>
          </g>
        );

      case 4: // 【楽】 (デフォルト) 普通の笑顔
      default:
        return (
          <g>
            {/* 目: 普通の黒丸 */}
            <circle cx={leftEyeX} cy={faceY} r={6} fill={STROKE_COLOR} />
            <circle cx={rightEyeX} cy={faceY} r={6} fill={STROKE_COLOR} />
            {/* 口: にっこり */}
            <path d={`M ${centerX - 15} ${faceY + 20} Q ${centerX} ${faceY + 35}, ${centerX + 15} ${faceY + 20}`} fill="none" stroke={STROKE_COLOR} strokeWidth={4} strokeLinecap="round" />
          </g>
        );
    }
  };

  return (
    <svg
      width="240"
      height={320}
      viewBox={`0 0 ${viewBoxW} ${viewBoxH}`}
      xmlns="http://www.w3.org/2000/svg"
      className="character-svg animate-sway" 
      style={{ overflow: 'visible' }}
    >
      {/* 描画順序:
        1. 指 (手のひらの後ろに配置して接続部を隠す)
        2. 手のひら (胴体)
        3. 顔パーツ
      */}

      {/* --- 指レイヤー --- */}
      {/* 各指は単なる線(stroke)で描画し、先端を丸く(round)することで指らしく見せる */}
      <g>
        <path d={p1.d} {...COMMON_STYLE} strokeWidth={p1.width} />
        <path d={p2.d} {...COMMON_STYLE} strokeWidth={p2.width} />
        <path d={p3.d} {...COMMON_STYLE} strokeWidth={p3.width} />
        <path d={p4.d} {...COMMON_STYLE} strokeWidth={p4.width} />
        <path d={p5.d} {...COMMON_STYLE} strokeWidth={p5.width} />
      </g>

      {/* --- 胴体（手のひら）レイヤー --- */}
      <ellipse cx={centerX} cy={centerY} rx={palmRx} ry={palmRy} {...COMMON_STYLE} />

      {/* --- 顔レイヤー --- */}
      {renderFace()}

    </svg>
  );
}; 

export default DynamicRabbitCharacter;