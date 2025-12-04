import React, { useState, useEffect } from 'react';

// 型定義（既存のものを想定）
interface CharacterProps {
  thumbLength: number;  // P1: 親指 (ツノ)
  indexLength: number;  // P2: 人差し指 (左足外)
  middleLength: number; // P3: 中指 (左足内)
  ringLength: number;   // P4: 薬指 (右足内)
  littleLength: number; // P5: 小指 (右足外)
  bodySize: number;     // P6: 胴体の大きさ
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
  // --- パラメータの正規化 (表示倍率の調整) ---
  // 入力1~5を、適切なピクセル長さに変換
  const scale = 1.2;
  const bodyRadius = 45 + (bodySize * 6); // 胴体の半径 (基本サイズ + 可変)
  
  // 各指（足・ツノ）の長さ計算
  const lenThumb = 20 + (thumbLength * 12); // ツノは少し長めに
  const lenIndex = 15 + (indexLength * 8);
  const lenMiddle = 15 + (middleLength * 8);
  const lenRing = 15 + (ringLength * 8);
  const lenLittle = 15 + (littleLength * 8);

  // --- 座標計算 ---
  const cx = 150; // キャンバス中心X
  const cy = 150; // キャンバス中心Y

  // 角度（ラジアン）: 12時= -PI/2, 3時= 0, 6時= PI/2, 9時= PI
  
  // 1. 親指（ツノ/耳）: 左上 (約10時半方向 = -135度近辺)
  const angleThumb = -3 * Math.PI / 4; 
  const thumbStart = {
    x: cx + bodyRadius * Math.cos(angleThumb),
    y: cy + bodyRadius * Math.sin(angleThumb)
  };
  const thumbEnd = {
    x: cx + (bodyRadius + lenThumb) * Math.cos(angleThumb),
    y: cy + (bodyRadius + lenThumb) * Math.sin(angleThumb)
  };

  // 2. 足（4本の指）: 下側に配置
  // 配置角度: 人差指(左外) -> 小指(右外)
  const angleIndex = Math.PI - 0.5;   // 左下
  const angleMiddle = Math.PI - 1.0;  // 左下寄り
  const angleRing = 0.5 + 0.5;        // 右下寄り
  const angleLittle = 0.5;            // 右下

  // 足の描画関数ヘルパー
  const getLegCoords = (angle: number, length: number) => {
    const startX = cx + bodyRadius * Math.cos(angle);
    const startY = cy + bodyRadius * Math.sin(angle); // 円周上
    // 足は地面に向かって垂直に近い形で伸ばすか、放射状にするか
    // ここではキャラクターっぽく少し放射状に伸ばします
    const endX = cx + (bodyRadius + length) * Math.cos(angle);
    const endY = cy + (bodyRadius + length) * Math.sin(angle);
    return { startX, startY, endX, endY };
  };

  const legIndex = getLegCoords(angleIndex, lenIndex);    // 左足（外）
  const legMiddle = getLegCoords(angleMiddle, lenMiddle); // 左足（内）
  const legRing = getLegCoords(angleRing, lenRing);       // 右足（内）
  const legLittle = getLegCoords(angleLittle, lenLittle); // 右足（外）

  // --- 表情の決定 ---
  const renderFace = () => {
    // シンプルな顔のパーツ配置
    const eyeY = cy; 
    const eyeX_L = cx - 15;
    const eyeX_R = cx + 15;
    const mouthY = cy + 15;

    // 表情タイプによる分岐 (1:喜, 2:怒, 3:哀, 4:楽, 5:眠)
    // ※ ユーザーの画像では「3:哀」が選択されているため、デフォルトはシンプルに
    // ここでは例として「哀（Sad）」の涙を描画
    
    let mouthPath = "";
    let eyeContent = null;
    let tear = null;

    switch(emotionType) {
      case 1: // 喜 (Smile)
        mouthPath = `M ${cx-10} ${mouthY} Q ${cx} ${mouthY+10} ${cx+10} ${mouthY}`;
        eyeContent = (
          <>
            <circle cx={eyeX_L} cy={eyeY} r="3" fill="black" />
            <circle cx={eyeX_R} cy={eyeY} r="3" fill="black" />
          </>
        );
        break;
      case 2: // 怒 (Angry)
        mouthPath = `M ${cx-10} ${mouthY+5} Q ${cx} ${mouthY} ${cx+10} ${mouthY+5}`;
        eyeContent = (
          <>
             <line x1={eyeX_L-5} y1={eyeY-5} x2={eyeX_L+5} y2={eyeY} stroke="black" strokeWidth="2" />
             <line x1={eyeX_R+5} y1={eyeY-5} x2={eyeX_R-5} y2={eyeY} stroke="black" strokeWidth="2" />
             <circle cx={eyeX_L} cy={eyeY} r="2" fill="black" />
             <circle cx={eyeX_R} cy={eyeY} r="2" fill="black" />
          </>
        );
        break;
      case 3: // 哀 (Sad) - 画像の状態
        mouthPath = `M ${cx-8} ${mouthY} Q ${cx} ${mouthY-3} ${cx+8} ${mouthY} L ${cx+6} ${mouthY+2}`; // へにょっとした口
        eyeContent = (
          <>
            <line x1={eyeX_L-4} y1={eyeY} x2={eyeX_L+4} y2={eyeY} stroke="black" strokeWidth="2" />
            <line x1={eyeX_R-4} y1={eyeY} x2={eyeX_R+4} y2={eyeY} stroke="black" strokeWidth="2" />
          </>
        );
        // 涙
        tear = (
           <path d={`M ${eyeX_L-5} ${eyeY+5} Q ${eyeX_L-8} ${eyeY+15} ${eyeX_L-5} ${eyeY+15} Q ${eyeX_L-2} ${eyeY+15} ${eyeX_L-5} ${eyeY+5}`} fill="#aaccff" stroke="#4488cc" strokeWidth="1"/>
        );
        break;
      default: // その他・デフォルト
        mouthPath = `M ${cx-5} ${mouthY} H ${cx+5}`;
        eyeContent = (
          <>
            <circle cx={eyeX_L} cy={eyeY} r="3" fill="black" />
            <circle cx={eyeX_R} cy={eyeY} r="3" fill="black" />
          </>
        );
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
        {/* 定義: フィルタや共通スタイル */}
        <defs>
          {/* 必要であれば影などのフィルタ */}
        </defs>

        {/* 1. 足 (Bodyの後ろに描画する場合) */}
        {/* P2: Index (Left Outer) */}
        <line x1={legIndex.startX} y1={legIndex.startY} x2={legIndex.endX} y2={legIndex.endY} 
              stroke="black" strokeWidth="14" strokeLinecap="round" />
        {/* P5: Little (Right Outer) */}
        <line x1={legLittle.startX} y1={legLittle.startY} x2={legLittle.endX} y2={legLittle.endY} 
              stroke="black" strokeWidth="14" strokeLinecap="round" />

        {/* 2. 胴体 (Body) */}
        <circle cx={cx} cy={cy} r={bodyRadius} fill="white" stroke="black" strokeWidth="6" />

        {/* 3. 足 (Bodyの前に描画する内側の足) */}
        {/* P3: Middle (Left Inner) */}
        <line x1={legMiddle.startX} y1={legMiddle.startY} x2={legMiddle.endX} y2={legMiddle.endY} 
              stroke="black" strokeWidth="14" strokeLinecap="round" />
        {/* P4: Ring (Right Inner) */}
        <line x1={legRing.startX} y1={legRing.startY} x2={legRing.endX} y2={legRing.endY} 
              stroke="black" strokeWidth="14" strokeLinecap="round" />
        
        {/* 足の継ぎ目を隠すための白い上書き（オプション：より綺麗に見せるため） */}
        <circle cx={cx} cy={cy} r={bodyRadius - 3} fill="white" stroke="none" />

        {/* 4. ツノ/親指 (Bodyの前面または背面、デザインによるが今回は一体化して見えるように配置) */}
        <line x1={thumbStart.x} y1={thumbStart.y} x2={thumbEnd.x} y2={thumbEnd.y} 
              stroke="black" strokeWidth="16" strokeLinecap="round" />
        {/* ツノの付け根を綺麗にするための白丸 */}
        <circle cx={thumbStart.x} cy={thumbStart.y} r="7" fill="black" /> 

        {/* 胴体の枠線を再描画してツノの根元を統合感を出す（シンプル化のため今回は枠線を上に被せない）
            ただし、「白塗り・黒太線」のキャラクターらしさを出すには、
            円を描く -> その上にパーツを描く -> 最後に顔、の順序が重要です。
        */}
        
        {/* 修正：レイヤー順序の整理 
           「テノヒラくん」は一つの有機的なシルエットに見えるべきなので、
           実際は path で結合するのがベストですが、今回は line + circle で簡易再現します。
           線を Body となじませるため、Bodyを最後に描画しなおします（中抜き）
        */}
        <circle cx={cx} cy={cy} r={bodyRadius} fill="white" stroke="black" strokeWidth="6" />

        {/* 顔パーツ */}
        {renderFace()}

      </svg>
    </div>
  );
};

export default TenohiraCharacter;