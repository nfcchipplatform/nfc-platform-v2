import React from 'react';

interface CharacterProps {
  thumbLength: number;
  indexLength: number;
  middleLength: number;
  ringLength: number;
  littleLength: number;
  bodySize: number;
  emotionType: number; // 1:喜, 2:怒, 3:哀, 4:楽, 5:眠
}

const TenohiraCharacter: React.FC<CharacterProps> = ({
  thumbLength,
  indexLength,
  middleLength,
  ringLength,
  littleLength,
  bodySize,
  emotionType,
}) => {
  // --- 座標定義 ---
  const cx = 150;
  const cy = 150;

  // --- 胴体の形状計算（正円 -> 縦長楕円） ---
  const rx = 45 + (bodySize - 1) * 2.5;
  const ry = rx + (bodySize - 1) * 12;

  const bodyPath = `
    M ${cx} ${cy - ry} 
    Q ${cx + rx} ${cy - ry} ${cx + rx} ${cy} 
    Q ${cx + rx} ${cy + ry} ${cx} ${cy + ry} 
    Q ${cx - rx} ${cy + ry} ${cx - rx} ${cy} 
    Q ${cx - rx} ${cy - ry} ${cx} ${cy - ry} 
    Z
  `;

  const getEllipseCoords = (angleRad: number, radiusX: number, radiusY: number) => {
    return {
      x: cx + radiusX * Math.cos(angleRad),
      y: cy + radiusY * Math.sin(angleRad)
    };
  };

  // --- 親指（アンテナ） ---
  const lenThumb = 30 + (thumbLength * 12);
  const angleThumb = -3 * Math.PI / 4; 
  const tStart = getEllipseCoords(angleThumb, rx, ry);
  const vecX = Math.cos(angleThumb);
  const vecY = Math.sin(angleThumb);
  const perpX = -vecY; 
  const perpY = vecX;
  const zigWidth = 10; 
  const tMid1 = { x: tStart.x + (lenThumb * 0.33) * vecX + zigWidth * perpX, y: tStart.y + (lenThumb * 0.33) * vecY + zigWidth * perpY };
  const tMid2 = { x: tStart.x + (lenThumb * 0.66) * vecX - zigWidth * perpX, y: tStart.y + (lenThumb * 0.66) * vecY - zigWidth * perpY };
  const tEnd = { x: tStart.x + lenThumb * vecX, y: tStart.y + lenThumb * vecY };
  const thumbPath = `M ${tStart.x} ${tStart.y} L ${tMid1.x} ${tMid1.y} L ${tMid2.x} ${tMid2.y} L ${tEnd.x} ${tEnd.y}`;

  // --- 足 ---
  const lenIndex = 15 + (indexLength * 8);
  const lenMiddle = 15 + (middleLength * 8);
  const lenRing = 15 + (ringLength * 8);
  const lenLittle = 15 + (littleLength * 8);
  const angleIndex = Math.PI - 0.5;
  const angleMiddle = Math.PI - 1.0;
  const angleRing = 0.5 + 0.5;
  const angleLittle = 0.5;

  const getLegCoords = (angle: number, length: number) => {
    const start = getEllipseCoords(angle, rx, ry);
    const endX = cx + (rx + length) * Math.cos(angle);
    const endY = cy + (ry + length) * Math.sin(angle);
    return { startX: start.x, startY: start.y, endX, endY };
  };

  const legIndex = getLegCoords(angleIndex, lenIndex);
  const legMiddle = getLegCoords(angleMiddle, lenMiddle);
  const legRing = getLegCoords(angleRing, lenRing);
  const legLittle = getLegCoords(angleLittle, lenLittle);

  // --- 表情レンダリング（修正部分） ---
  const renderFace = () => {
    const eyeY = cy; 
    const eyeX_L = cx - 15;
    const eyeX_R = cx + 15;
    const mouthY = cy + 15;
    
    let mouthPath = "";
    let eyeContent = null;
    let tear = null;

    switch(emotionType) {
      case 1: // 喜 (Joy)
        mouthPath = `M ${cx-10} ${mouthY} Q ${cx} ${mouthY+10} ${cx+10} ${mouthY}`;
        eyeContent = <><circle cx={eyeX_L} cy={eyeY} r="3" fill="black" /><circle cx={eyeX_R} cy={eyeY} r="3" fill="black" /></>;
        break;
      case 2: // 怒 (Angry)
        mouthPath = `M ${cx-10} ${mouthY+5} Q ${cx} ${mouthY} ${cx+10} ${mouthY+5}`;
        eyeContent = <><line x1={eyeX_L-5} y1={eyeY-5} x2={eyeX_L+5} y2={eyeY} stroke="black" strokeWidth="2" /><line x1={eyeX_R+5} y1={eyeY-5} x2={eyeX_R-5} y2={eyeY} stroke="black" strokeWidth="2" /><circle cx={eyeX_L} cy={eyeY} r="2" fill="black" /><circle cx={eyeX_R} cy={eyeY} r="2" fill="black" /></>;
        break;
      case 3: // 哀 (Sad)
        mouthPath = `M ${cx-8} ${mouthY} Q ${cx} ${mouthY-3} ${cx+8} ${mouthY} L ${cx+6} ${mouthY+2}`;
        eyeContent = <><line x1={eyeX_L-4} y1={eyeY} x2={eyeX_L+4} y2={eyeY} stroke="black" strokeWidth="2" /><line x1={eyeX_R-4} y1={eyeY} x2={eyeX_R+4} y2={eyeY} stroke="black" strokeWidth="2" /></>;
        tear = <path d={`M ${eyeX_L-5} ${eyeY+5} Q ${eyeX_L-8} ${eyeY+15} ${eyeX_L-5} ${eyeY+15} Q ${eyeX_L-2} ${eyeY+15} ${eyeX_L-5} ${eyeY+5}`} fill="#aaccff" stroke="#4488cc" strokeWidth="1"/>;
        break;
      case 5: // 眠 (Sleep) - 【新規追加】
        // 目を閉じた表現（緩やかな下向きのカーブ）
        const sleepEyeL = `M ${eyeX_L-7} ${eyeY} Q ${eyeX_L} ${eyeY+5} ${eyeX_L+7} ${eyeY}`;
        const sleepEyeR = `M ${eyeX_R-7} ${eyeY} Q ${eyeX_R} ${eyeY+5} ${eyeX_R+7} ${eyeY}`;
        eyeContent = (
          <>
            <path d={sleepEyeL} fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
            <path d={sleepEyeR} fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
          </>
        );
        // 小さく開けた口
        mouthPath = `M ${cx-3} ${mouthY+3} Q ${cx} ${mouthY+6} ${cx+3} ${mouthY+3}`;
        break;
      case 4: // 楽 (Relaxed) - デフォルトと同じ
      default: // その他
        mouthPath = `M ${cx-10} ${mouthY} Q ${cx} ${mouthY+5} ${cx+10} ${mouthY}`; // 穏やかな笑顔
        eyeContent = <><circle cx={eyeX_L} cy={eyeY} r="3" fill="black" /><circle cx={eyeX_R} cy={eyeY} r="3" fill="black" /></>;
        break;
    }

    return (
      <g>
        {eyeContent}
        <path d={mouthPath} fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
        {tear}
      </g>
    );
  };

  return (
    <div className="flex justify-center items-center w-full h-full animate-sway">
      <svg width="300" height="300" viewBox="0 0 300 300">
        <line x1={legIndex.startX} y1={legIndex.startY} x2={legIndex.endX} y2={legIndex.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />
        <line x1={legLittle.startX} y1={legLittle.startY} x2={legLittle.endX} y2={legLittle.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />
        <path d={bodyPath} fill="white" stroke="black" strokeWidth="6" />
        <line x1={legMiddle.startX} y1={legMiddle.startY} x2={legMiddle.endX} y2={legMiddle.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />
        <line x1={legRing.startX} y1={legRing.startY} x2={legRing.endX} y2={legRing.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />
        <path d={bodyPath} fill="white" stroke="none" />
        <path d={thumbPath} stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {renderFace()}
      </svg>
    </div>
  );
};

export default TenohiraCharacter;