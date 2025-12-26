// src/lib/nailImageConfig.ts
// ネイルのTOP画像の設定と管理

/**
 * ネイルのTOP画像の設定
 * 画像は public/images/nails/ フォルダに配置してください
 */
export interface NailTopImageConfig {
  id: string;
  path: string; // /images/nails/xxx.jpg の形式
  name?: string; // 画像の名前（管理用）
  fingerId?: string; // 特定の指に紐づける場合（thumb, index, middle, ring, pinky）
  tags?: string[]; // タグ（後でフィルタリングなどに使用可能）
}

/**
 * ネイルのTOP画像のリスト
 * 画像を追加する場合は、この配列に追加してください
 */
export const NAIL_TOP_IMAGES: NailTopImageConfig[] = [
  // 例: { id: "1", path: "/images/nails/top1.jpg", name: "トップ画像1", fingerId: "thumb", tags: ["default"] },
  // 画像を追加する場合は、上記の形式で追加してください
];

/**
 * 特定の指のTOP画像を取得
 */
export function getNailTopImageByFinger(fingerId: string): NailTopImageConfig | null {
  const image = NAIL_TOP_IMAGES.find(img => img.fingerId === fingerId);
  return image || null;
}

/**
 * ランダムにTOP画像を選択する（後でアルゴリズムを変更可能）
 */
export function getRandomNailTopImage(): NailTopImageConfig | null {
  if (NAIL_TOP_IMAGES.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * NAIL_TOP_IMAGES.length);
  return NAIL_TOP_IMAGES[randomIndex];
}

/**
 * タグでフィルタリングしてTOP画像を取得
 */
export function getNailTopImagesByTag(tag: string): NailTopImageConfig[] {
  return NAIL_TOP_IMAGES.filter(img => img.tags?.includes(tag));
}

