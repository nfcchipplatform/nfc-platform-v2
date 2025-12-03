// src/components/DynamicRabbitCharacter.tsx

import React from 'react';

interface DynamicRabbitCharacterProps {
  earLength: number;
  armLength: number;
  legLength: number;
  bodySize: number;
}

const DynamicRabbitCharacter: React.FC<DynamicRabbitCharacterProps> = ({
  earLength,
  armLength,
  legLength,
  bodySize,
}) => {
  const baseParam = 3.0;
  
  // 基本の係数計算関数
  const getFactor = (val: number, sensitivity: number = 1.0) => {
    const normalized = val / baseParam;
    return 1.0 + (normalized - 1.0) * sensitivity;
  };

  // 【修正】手と足の入力値(1～5)を、(3～5)の範囲に変換する関数
  // これにより、入力1のときに 以前の3相当（1.0倍）のサイズになります。
  // 入力5のときは 以前の5相当 のサイズになります。
  const mapToMediumBase = (val: number) => {
    // 1 -> 3.0
    // 5 -> 5.0
    // 傾き 0.5
    return 3.0 + (val - 1.0) * 0.5;
  };

  // P1: 耳 (変更なし)
  const pEar = getFactor(earLength, 0.8);
  
  // P2: 手 (1331の「3」を基準にするため、マッピング関数を通す)
  const pArm = getFactor(mapToMediumBase(armLength), 0.8); 
  
  // P3: 足 (1331の「3」を基準にするため、マッピング関数を通す)
  const pLeg = getFactor(mapToMediumBase(legLength), 0.9); 
  
  // P4: 胴体 (変更なし)
  const pBody = getFactor(bodySize, 0.7);

  const STROKE_WIDTH = 5;
  const FILL_COLOR = 'white';
  const STROKE_COLOR = 'black';
  
  const COMMON_STYLE: React.SVGAttributes<SVGElement> = {
    fill: FILL_COLOR,
    stroke: STROKE_COLOR,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  const viewBoxHeight = 400;
  const centerX = 120;
  
  // 1. 胴体
  const headTopY = 70 * (2 - pBody) + 20; 
  const neckY = 130 + 20;
  const bodyBottomY = neckY + 110 * pBody;
  const bodyWidthHalf = 70 * pBody;

  const bodyPath = `
    M ${centerX - 35 * pBody} ${neckY}
    C ${centerX - 45 * pBody} ${neckY - 30}, ${centerX - 45 * pBody} ${headTopY}, ${centerX} ${headTopY}
    C ${centerX + 45 * pBody} ${headTopY}, ${centerX + 45 * pBody} ${neckY - 30}, ${centerX + 35 * pBody} ${neckY}
    C ${centerX + bodyWidthHalf + 10} ${neckY + 40}, ${centerX + bodyWidthHalf} ${bodyBottomY - 10}, ${centerX} ${bodyBottomY}
    C ${centerX - bodyWidthHalf} ${bodyBottomY - 10}, ${centerX - bodyWidthHalf - 10} ${neckY + 40}, ${centerX - 35 * pBody} ${neckY}
    Z
  `;

  // 2. 耳
  const earBaseY = headTopY + 10 * pBody;
  const earHeight = 50 * pEar;

  // 3. 腕
  const shoulderX = centerX - bodyWidthHalf + 20 * pBody; 
  const shoulderY = neckY + 40 * pBody;
  const armThickness = 20 * pArm;
  const armLen = 50 * pArm;
  const handX = shoulderX - armLen * 0.9; 
  const handY = shoulderY - armLen * 0.7;

  const leftArmPath = `
    M ${shoulderX} ${shoulderY - 10} 
    Q ${shoulderX - 10} ${shoulderY - 40} ${handX + 5} ${handY - 5}
    A ${armThickness/2} ${armThickness/2} 0 0 0 ${handX - 5} ${handY + 15}
    Q ${shoulderX - 40} ${shoulderY + 10} ${shoulderX} ${shoulderY + 20}
    Z
  `;

  // 4. 足
  const legRootY = bodyBottomY - 25 * pBody; 
  const legSpacing = 30 * pBody;

  const legW = 25 * pLeg;
  const legH = 40 * pLeg;
  const footL = 35 * pLeg;

  const lx = centerX - legSpacing;
  const ly = legRootY;

  const leftLegPath = `
    M ${lx} ${ly}
    L ${lx} ${ly + legH}
    Q ${lx} ${ly + legH + legW} ${lx - footL} ${ly + legH + legW * 0.8}
    Q ${lx - footL - 10} ${ly + legH} ${lx - footL} ${ly + legH - 10}
    L ${lx - legW} ${ly + 10}
    L ${lx} ${ly}
    Z
  `;

  const rx = centerX + legSpacing;
  const ry = legRootY;

  const rightLegPath = `
    M ${rx} ${ry}
    L ${rx} ${ry + legH}
    Q ${rx} ${ry + legH + legW} ${rx + footL} ${ry + legH + legW * 0.8}
    Q ${rx + footL + 10} ${ry + legH} ${rx + footL} ${ry + legH - 10}
    L ${rx + legW} ${ry + 10}
    L ${rx} ${ry}
    Z
  `;

  return (
    <svg
      width="240"
      height={viewBoxHeight}
      viewBox={`0 0 240 ${viewBoxHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      className="character-svg animate-sway" 
      style={{ overflow: 'visible' }}
    >
      <g transform={`rotate(-10, ${centerX}, ${earBaseY})`}>
        <ellipse cx={centerX - 20 * pBody} cy={earBaseY - earHeight / 2} rx={18 * pBody} ry={earHeight} {...COMMON_STYLE} />
      </g>
      <g transform={`rotate(10, ${centerX}, ${earBaseY})`}>
        <ellipse cx={centerX + 20 * pBody} cy={earBaseY - earHeight / 2} rx={18 * pBody} ry={earHeight} {...COMMON_STYLE} />
      </g>

      <path d={leftArmPath} {...COMMON_STYLE} />
      <g transform={`scale(-1, 1) translate(-240, 0)`}>
        <path d={leftArmPath} {...COMMON_STYLE} />
      </g>

      <path d={leftLegPath} {...COMMON_STYLE} />
      <path d={rightLegPath} {...COMMON_STYLE} />

      <path d={bodyPath} {...COMMON_STYLE} />

      <circle cx={centerX - 18 * pBody} cy={headTopY + 30 * pBody} r={5 * pBody} fill={STROKE_COLOR} />
      <circle cx={centerX + 18 * pBody} cy={headTopY + 30 * pBody} r={5 * pBody} fill={STROKE_COLOR} />
      <path
        d={`M ${centerX - 6 * pBody} ${headTopY + 45 * pBody} Q ${centerX} ${headTopY + 45 * pBody + 6 * pBody}, ${centerX + 6 * pBody} ${headTopY + 45 * pBody}`}
        fill="none"
        stroke={STROKE_COLOR}
        strokeWidth={STROKE_WIDTH - 1}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default DynamicRabbitCharacter;