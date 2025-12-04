import React from 'react';

interface CharacterProps {
  thumbLength: number;  // P1: 親指 (アンテナ/ツノ)
  indexLength: number;  // P2: 人差し指 (左足外)
  middleLength: number; // P3: 中指 (左足内)
  ringLength: number;   // P4: 薬指 (右足内)
  littleLength: number; // P5: 小指 (右足外)
  bodySize: number;     // P6: 胴体の大きさ (1:丸 -> 5:ひょうたん)
  emotionType: number;  // P7: 表情
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

  // --- 胴体の形状計算（丸 -> ひょうたん） ---
  // 基本半径
  const R = 45 + (bodySize * 6);
  
  // くびれの計算: bodySizeが1のときは0、5のときは最大20pxくびれる
  const pinch = bodySize > 1 ? (bodySize - 1) * 5 : 0;
  const waistX = R - pinch; 

  // ひょうたん型（または丸）のパスを作成
  // 上下左右の4つのカーブ（Q:2次ベジェ曲線）で描画
  // 制御点を(cx ± R, cy ± R/2)に置くことで、サイズ1のときは円に近い形、
  // サイズが上がると中央(cy)に向かって絞られる形になります。
  const bodyPath = `
    M ${cx} ${cy - R} 
    Q ${cx + R} ${cy - R / 2} ${cx + waistX} ${cy} 
    Q ${cx + R} ${cy + R / 2} ${cx} ${cy + R} 
    Q ${cx - R} ${cy + R / 2} ${cx - waistX} ${cy} 
    Q ${cx - R} ${cy - R / 2} ${cx} ${cy - R} 
    Z
  `;

  // --- 足・親指の計算 ---
  
  // 親指（アンテナ）: 左上 (-135度方向)
  // バイキンマン風ジグザグ
  const lenThumb = 30 + (thumbLength * 12);
  const angleThumb = -3 * Math.PI / 4; 
  
  // 始点（胴体の表面から生えるようにRを使って計算）
  // ※ひょうたん型になっても左上(-135度)の半径はほぼRに近いのでそのまま使用
  const tStart = {
    x: cx + R * Math.cos(angleThumb),
    y: cy + R * Math.sin(angleThumb)
  };
  
  const vecX = Math.cos(angleThumb);
  const vecY = Math.sin(angleThumb);
  const perpX = -vecY; 
  const perpY = vecX;
  const zigWidth = 10; 

  const tMid1 = {
    x: tStart.x + (lenThumb * 0.33) * vecX + zigWidth * perpX,
    y: tStart.y + (lenThumb * 0.33) * vecY + zigWidth * perpY
  };
  const tMid2 = {
    x: tStart.x + (lenThumb * 0.66) * vecX - zigWidth * perpX,
    y: tStart.y + (lenThumb * 0.66) * vecY - zigWidth * perpY
  };
  const tEnd = {
    x: tStart.x + lenThumb * vecX,
    y: tStart.y + lenThumb * vecY
  };

  const thumbPath = `M ${tStart.x} ${tStart.y} L ${tMid1.x} ${tMid1.y} L ${tMid2.x} ${tMid2.y} L ${tEnd.x} ${tEnd.y}`;

  // 足（4本の指）
  const lenIndex = 15 + (indexLength * 8);
  const lenMiddle = 15 + (middleLength * 8);
  const lenRing = 15 + (ringLength * 8);
  const lenLittle = 15 + (littleLength * 8);

  const angleIndex = Math.PI - 0.5;   // 左下
  const angleMiddle = Math.PI - 1.0;  // 左下寄り
  const angleRing = 0.5 + 0.5;        // 右下寄り
  const angleLittle = 0.5;            // 右下

  // 足の座標計算関数
  const getLegCoords = (angle: number, length: number) => {
    // 胴体の輪郭座標を計算（簡易的に円Rとみなす）
    // ※厳密にはひょうたん型のアウトライン上ですが、下側は膨らんでいるためRで近似しても違和感は少ない
    const startX = cx + R * Math.cos(angle);
    const startY = cy + R * Math.sin(angle);
    const endX = cx + (R + length) * Math.cos(angle);
    const endY = cy + (R + length) * Math.sin(angle);
    return { startX, startY, endX, endY };
  };

  const legIndex = getLegCoords(angleIndex, lenIndex);
  const legMiddle = getLegCoords(angleMiddle, lenMiddle);
  const legRing = getLegCoords(angleRing, lenRing);
  const legLittle = getLegCoords(angleLittle, lenLittle);

  // --- 表情レンダリング ---
  const renderFace = () => {
    const eyeY = cy; 
    const eyeX_L = cx - 15;
    const eyeX_R = cx + 15;
    const mouthY = cy + 15;
    
    let mouthPath = "";
    let eyeContent = null;
    let tear = null;

    switch(emotionType) {
      case 1: // 喜
        mouthPath = `M ${cx-10} ${mouthY} Q ${cx} ${mouthY+10} ${cx+10} ${mouthY}`;
        eyeContent = <><circle cx={eyeX_L} cy={eyeY} r="3" fill="black" /><circle cx={eyeX_R} cy={eyeY} r="3" fill="black" /></>;
        break;
      case 2: // 怒
        mouthPath = `M ${cx-10} ${mouthY+5} Q ${cx} ${mouthY} ${cx+10} ${mouthY+5}`;
        eyeContent = <><line x1={eyeX_L-5} y1={eyeY-5} x2={eyeX_L+5} y2={eyeY} stroke="black" strokeWidth="2" /><line x1={eyeX_R+5} y1={eyeY-5} x2={eyeX_R-5} y2={eyeY} stroke="black" strokeWidth="2" /><circle cx={eyeX_L} cy={eyeY} r="2" fill="black" /><circle cx={eyeX_R} cy={eyeY} r="2" fill="black" /></>;
        break;
      case 3: // 哀
        mouthPath = `M ${cx-8} ${mouthY} Q ${cx} ${mouthY-3} ${cx+8} ${mouthY} L ${cx+6} ${mouthY+2}`;
        eyeContent = <><line x1={eyeX_L-4} y1={eyeY} x2={eyeX_L+4} y2={eyeY} stroke="black" strokeWidth="2" /><line x1={eyeX_R-4} y1={eyeY} x2={eyeX_R+4} y2={eyeY} stroke="black" strokeWidth="2" /></>;
        tear = <path d={`M ${eyeX_L-5} ${eyeY+5} Q ${eyeX_L-8} ${eyeY+15} ${eyeX_L-5} ${eyeY+15} Q ${eyeX_L-2} ${eyeY+15} ${eyeX_L-5} ${eyeY+5}`} fill="#aaccff" stroke="#4488cc" strokeWidth="1"/>;
        break;
      default:
        mouthPath = `M ${cx-5} ${mouthY} H ${cx+5}`;
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
        
        {/* 奥側の足 */}
        <line x1={legIndex.startX} y1={legIndex.startY} x2={legIndex.endX} y2={legIndex.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />
        <line x1={legLittle.startX} y1={legLittle.startY} x2={legLittle.endX} y2={legLittle.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />

        {/* 胴体 (丸～ひょうたん型) */}
        <path d={bodyPath} fill="white" stroke="black" strokeWidth="6" />

        {/* 手前側の足 */}
        <line x1={legMiddle.startX} y1={legMiddle.startY} x2={legMiddle.endX} y2={legMiddle.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />
        <line x1={legRing.startX} y1={legRing.startY} x2={legRing.endX} y2={legRing.endY} stroke="black" strokeWidth="14" strokeLinecap="round" />
        
        {/* 足の付け根を綺麗にするため、胴体内部と同じ白で「足の根元」を上書き (strokeなしのbodyPath) */}
        <path d={bodyPath} fill="white" stroke="none" />

        {/* 親指 (アンテナ) */}
        {/* 白い丸(付け根)は削除しました。胴体の線とそのまま繋がって見えます */}
        <path d={thumbPath} stroke="black" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />

        {/* 顔 */}
        {renderFace()}

      </svg>
    </div>
  );
};

export default TenohiraCharacter;