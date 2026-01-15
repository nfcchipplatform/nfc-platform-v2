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
 * 
 * 画像ファイルを public/images/soul/ フォルダに配置したら、
 * 以下の形式で追加してください：
 * { id: "画像ID", path: "/images/soul/ファイル名.jpg", name: "画像名", tags: ["default"] }
 */
export const SOUL_IMAGES: SoulImageConfig[] = [
  { id: "001", path: "/images/soul/001.jpg", name: "Healing Soft Light", tags: ["healing", "calm"] },
  { id: "002", path: "/images/soul/002.jpg", name: "Calm Water Blue", tags: ["calm", "nature"] },
  { id: "003", path: "/images/soul/003.jpg", name: "Quiet Forest Green", tags: ["nature", "healing"] },
  { id: "004", path: "/images/soul/004.jpg", name: "Peaceful Ocean", tags: ["calm", "nature"] },
  { id: "005", path: "/images/soul/005.jpg", name: "Warm Sunrise Sky", tags: ["warm", "energy"] },
  { id: "006", path: "/images/soul/006.jpg", name: "Meditation Zen", tags: ["healing", "calm"] },
  { id: "007", path: "/images/soul/007.jpg", name: "Relaxing Tea", tags: ["calm", "healing"] },
  { id: "008", path: "/images/soul/008.jpg", name: "Spa Relaxation", tags: ["healing", "calm"] },
  { id: "009", path: "/images/soul/009.jpg", name: "Soft Pastel", tags: ["calm", "creative"] },
  { id: "010", path: "/images/soul/010.jpg", name: "Nature Flowers", tags: ["nature", "healing"] },
  { id: "011", path: "/images/soul/011.jpg", name: "Bright Energy", tags: ["energy"] },
  { id: "012", path: "/images/soul/012.jpg", name: "Neon City Night", tags: ["energy", "urban"] },
  { id: "013", path: "/images/soul/013.jpg", name: "Runner Sport", tags: ["energy", "active"] },
  { id: "014", path: "/images/soul/014.jpg", name: "Dance Stage", tags: ["energy", "joy"] },
  { id: "015", path: "/images/soul/015.jpg", name: "Festival Lights", tags: ["energy", "joy"] },
  { id: "016", path: "/images/soul/016.jpg", name: "Fire Flame", tags: ["energy"] },
  { id: "017", path: "/images/soul/017.jpg", name: "Mountain Adventure", tags: ["energy", "nature"] },
  { id: "018", path: "/images/soul/018.jpg", name: "Travel Adventure", tags: ["energy"] },
  { id: "019", path: "/images/soul/019.jpg", name: "Sport Training", tags: ["energy", "focus"] },
  { id: "020", path: "/images/soul/020.jpg", name: "Orange Sunset", tags: ["warm", "energy"] },
  { id: "021", path: "/images/soul/021.jpg", name: "Focus Workspace", tags: ["focus", "creative"] },
  { id: "022", path: "/images/soul/022.jpg", name: "Books Library", tags: ["focus", "calm"] },
  { id: "023", path: "/images/soul/023.jpg", name: "Art Painting", tags: ["creative"] },
  { id: "024", path: "/images/soul/024.jpg", name: "Music Guitar", tags: ["creative", "joy"] },
  { id: "025", path: "/images/soul/025.jpg", name: "Coding Laptop", tags: ["focus", "creative"] },
  { id: "026", path: "/images/soul/026.jpg", name: "Coffee Work", tags: ["focus"] },
  { id: "027", path: "/images/soul/027.jpg", name: "Minimal Design", tags: ["focus", "calm"] },
  { id: "028", path: "/images/soul/028.jpg", name: "Notebook Writing", tags: ["focus"] },
  { id: "029", path: "/images/soul/029.jpg", name: "Photography Camera", tags: ["creative"] },
  { id: "030", path: "/images/soul/030.jpg", name: "Handmade Craft", tags: ["creative"] },
  { id: "031", path: "/images/soul/031.jpg", name: "Smile Portrait Woman", tags: ["joy", "social"] },
  { id: "032", path: "/images/soul/032.jpg", name: "Portrait Man", tags: ["social"] },
  { id: "033", path: "/images/soul/033.jpg", name: "Friends Laugh", tags: ["joy", "social"] },
  { id: "034", path: "/images/soul/034.jpg", name: "Family Happy", tags: ["joy", "social"] },
  { id: "035", path: "/images/soul/035.jpg", name: "Couple Love", tags: ["joy", "social"] },
  { id: "036", path: "/images/soul/036.jpg", name: "Happy Celebration", tags: ["joy"] },
  { id: "037", path: "/images/soul/037.jpg", name: "Children Play", tags: ["joy", "social"] },
  { id: "038", path: "/images/soul/038.jpg", name: "People Smile", tags: ["joy", "social"] },
  { id: "039", path: "/images/soul/039.jpg", name: "Crowd Festival", tags: ["joy", "energy"] },
  { id: "040", path: "/images/soul/040.jpg", name: "Success Achievement", tags: ["energy", "joy"] },
  { id: "041", path: "/images/soul/041.jpg", name: "Moon Night", tags: ["mystery", "calm"] },
  { id: "042", path: "/images/soul/042.jpg", name: "Stars Sky", tags: ["mystery", "calm"] },
  { id: "043", path: "/images/soul/043.jpg", name: "Galaxy Space", tags: ["mystery"] },
  { id: "044", path: "/images/soul/044.jpg", name: "Rain Window", tags: ["calm", "mystery"] },
  { id: "045", path: "/images/soul/045.jpg", name: "Storm Clouds", tags: ["mystery", "energy"] },
  { id: "046", path: "/images/soul/046.jpg", name: "Fog Forest", tags: ["mystery", "nature"] },
  { id: "047", path: "/images/soul/047.jpg", name: "Desert Sand", tags: ["nature", "energy"] },
  { id: "048", path: "/images/soul/048.jpg", name: "Snow Winter", tags: ["calm", "nature"] },
  { id: "049", path: "/images/soul/049.jpg", name: "Autumn Leaves", tags: ["nature", "warm"] },
  { id: "050", path: "/images/soul/050.jpg", name: "Spring Flowers", tags: ["nature", "healing"] },
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

