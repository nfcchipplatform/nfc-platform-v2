// src/lib/soulImageDisplayAlgorithm.ts
// 魂の中に画像を表示するアルゴリズム（後で実装・変更しやすいように分離）

import { SoulImageConfig, getRandomSoulImage } from "./soulImageConfig";

/**
 * 画像表示アルゴリズムのタイプ
 */
export type ImageDisplayAlgorithm = 
  | "random" // ランダムに選択
  | "sequential" // 順番に表示
  | "by-shape" // 形状に応じて選択
  | "custom"; // カスタムアルゴリズム

/**
 * 画像表示アルゴリズムの設定
 */
export interface ImageDisplayConfig {
  algorithm: ImageDisplayAlgorithm;
  enabled: boolean; // 画像表示を有効にするか
  prefetchCount?: number; // 先読みする候補数
  // 後で追加可能な設定項目
  // interval?: number; // 画像切り替えの間隔（ミリ秒）
  // transitionDuration?: number; // トランジション時間
}

/**
 * 現在の形状に応じて画像を選択する（デフォルト実装）
 * 後でアルゴリズムを変更しやすいように関数として分離
 */
export function selectSoulImage(
  config: ImageDisplayConfig,
  currentShape: string,
  currentPhase: "LOADING" | "STANDBY" | "PRESSED"
): SoulImageConfig | null {
  if (!config.enabled) return null;

  switch (config.algorithm) {
    case "random":
      return getRandomSoulImage();
    
    case "sequential":
      // TODO: 順番に表示する実装
      return getRandomSoulImage();
    
    case "by-shape":
      // TODO: 形状に応じて選択する実装
      return getRandomSoulImage();
    
    case "custom":
      // TODO: カスタムアルゴリズムの実装
      return getRandomSoulImage();
    
    default:
      return null;
  }
}

/**
 * デフォルトの画像表示設定
 */
export const DEFAULT_IMAGE_DISPLAY_CONFIG: ImageDisplayConfig = {
  algorithm: "random",
  enabled: false, // デフォルトでは無効（後で有効化可能）
  prefetchCount: 5,
};

