// src/lib/soulImageConfig.ts
// 魂の中に表示する画像の設定と管理

/**
 * 魂の中に表示する画像の設定
 * 画像は public/images/soul/ フォルダに配置してください
 */
export interface SoulImageConfig {
  id: string;
  path: string; // /images/soul/xxx.jpg の形式
  name?: string; // 画像の名前（管理用）
  tags?: string[]; // タグ（後でフィルタリングなどに使用可能）
}

/**
 * デフォルトのフォールバック画像（画像が無い時に表示）
 */
const DEFAULT_FALLBACK_IMAGES: SoulImageConfig[] = [
  { 
    id: "fallback-1", 
    path: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop", 
    name: "フォールバック画像1", 
    tags: ["fallback", "default"] 
  },
  { 
    id: "fallback-2", 
    path: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop", 
    name: "フォールバック画像2", 
    tags: ["fallback", "default"] 
  },
];

/**
 * 魂の中に表示する画像のリスト
 * 画像を追加する場合は、この配列に追加してください
 */
export const SOUL_IMAGES: SoulImageConfig[] = [
  // 例: { id: "1", path: "/images/soul/image1.jpg", name: "画像1", tags: ["default"] },
  // 画像を追加する場合は、上記の形式で追加してください
];

/**
 * 画像のパスを取得する（画像が存在しない場合のフォールバック処理）
 */
export function getSoulImagePath(imageId: string | null): string | null {
  if (!imageId) return null;
  const image = SOUL_IMAGES.find(img => img.id === imageId);
  return image?.path || null;
}

/**
 * ランダムに画像を選択する（後でアルゴリズムを変更可能）
 * 画像が無い場合はフォールバック画像を返す
 */
export function getRandomSoulImage(): SoulImageConfig | null {
  const allImages = SOUL_IMAGES.length > 0 ? SOUL_IMAGES : DEFAULT_FALLBACK_IMAGES;
  if (allImages.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * allImages.length);
  return allImages[randomIndex];
}

/**
 * タグでフィルタリングして画像を取得
 */
export function getSoulImagesByTag(tag: string): SoulImageConfig[] {
  return SOUL_IMAGES.filter(img => img.tags?.includes(tag));
}

