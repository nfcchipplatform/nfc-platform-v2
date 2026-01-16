// src/lib/soulImageConfig.ts
// Soul image configuration and helpers.

/**
 * Soul image config.
 * Place files under public/images/soul/.
 */
export interface SoulImageConfig {
  id: string;
  path: string; // /images/soul/xxx.jpg
  name?: string; // Image name (optional)
  tags?: string[]; // Tags for filtering
  elementTags?: string[]; // Element tags (e.g. ["Fire", "Wind"])
  userIds?: string[]; // Specific user IDs (optional)
}

export type SoulImageFilter = {
  elementTags?: string[];
  userIds?: string[];
};

/**
 * Local fallback (keeps rendering within /images/soul).
 */
const DEFAULT_FALLBACK_IMAGES: SoulImageConfig[] = [
  {
    id: "fallback-001",
    path: "/images/soul/001.jpg",
    name: "Fallback Soul",
    tags: ["fallback", "default"],
  },
];

/**
 * Soul image list.
 * Add files under public/images/soul/ and register them here.
 * Example:
 * { id: "image-id", path: "/images/soul/file.jpg", name: "Image Name", tags: ["default"] }
 */
export const SOUL_IMAGES: SoulImageConfig[] = [
  { id: "001", path: "/images/soul/001.jpg", name: "Healing Soft Light", tags: ["Fire", "healing", "calm"] },
  { id: "002", path: "/images/soul/002.jpg", name: "Calm Water Blue", tags: ["Fire", "calm", "nature"] },
  { id: "003", path: "/images/soul/003.jpg", name: "Quiet Forest Green", tags: ["Fire", "nature", "healing"] },
  { id: "004", path: "/images/soul/004.jpg", name: "Peaceful Ocean", tags: ["Fire", "calm", "nature"] },
  { id: "005", path: "/images/soul/005.jpg", name: "Warm Sunrise Sky", tags: ["Fire", "warm", "energy"] },
  { id: "006", path: "/images/soul/006.jpg", name: "Meditation Zen", tags: ["Fire", "healing", "calm"] },
  { id: "007", path: "/images/soul/007.jpg", name: "Relaxing Tea", tags: ["Fire", "calm", "healing"] },
  { id: "008", path: "/images/soul/008.jpg", name: "Spa Relaxation", tags: ["Fire", "healing", "calm"] },
  { id: "009", path: "/images/soul/009.jpg", name: "Soft Pastel", tags: ["Fire", "calm", "creative"] },
  { id: "010", path: "/images/soul/010.jpg", name: "Nature Flowers", tags: ["Fire", "nature", "healing"] },
  { id: "011", path: "/images/soul/011.jpg", name: "Bright Energy", tags: ["Wind", "energy"] },
  { id: "012", path: "/images/soul/012.jpg", name: "Neon City Night", tags: ["Wind", "energy", "urban"] },
  { id: "013", path: "/images/soul/013.jpg", name: "Runner Sport", tags: ["Wind", "energy", "active"] },
  { id: "014", path: "/images/soul/014.jpg", name: "Dance Stage", tags: ["Wind", "energy", "joy"] },
  { id: "015", path: "/images/soul/015.jpg", name: "Festival Lights", tags: ["Wind", "energy", "joy"] },
  { id: "016", path: "/images/soul/016.jpg", name: "Fire Flame", tags: ["Wind", "energy"] },
  { id: "017", path: "/images/soul/017.jpg", name: "Mountain Adventure", tags: ["Wind", "energy", "nature"] },
  { id: "018", path: "/images/soul/018.jpg", name: "Travel Adventure", tags: ["Wind", "energy"] },
  { id: "019", path: "/images/soul/019.jpg", name: "Sport Training", tags: ["Wind", "energy", "focus"] },
  { id: "020", path: "/images/soul/020.jpg", name: "Orange Sunset", tags: ["Wind", "warm", "energy"] },
  { id: "021", path: "/images/soul/021.jpg", name: "Focus Workspace", tags: ["Void", "focus", "creative"] },
  { id: "022", path: "/images/soul/022.jpg", name: "Books Library", tags: ["Void", "focus", "calm"] },
  { id: "023", path: "/images/soul/023.jpg", name: "Art Painting", tags: ["Void", "creative"] },
  { id: "024", path: "/images/soul/024.jpg", name: "Music Guitar", tags: ["Void", "creative", "joy"] },
  { id: "025", path: "/images/soul/025.jpg", name: "Coding Laptop", tags: ["Void", "focus", "creative"] },
  { id: "026", path: "/images/soul/026.jpg", name: "Coffee Work", tags: ["Void", "focus"] },
  { id: "027", path: "/images/soul/027.jpg", name: "Minimal Design", tags: ["Void", "focus", "calm"] },
  { id: "028", path: "/images/soul/028.jpg", name: "Notebook Writing", tags: ["Void", "focus"] },
  { id: "029", path: "/images/soul/029.jpg", name: "Photography Camera", tags: ["Void", "creative"] },
  { id: "030", path: "/images/soul/030.jpg", name: "Handmade Craft", tags: ["Void", "creative"] },
  { id: "031", path: "/images/soul/031.jpg", name: "Smile Portrait Woman", tags: ["Earth", "joy", "social"] },
  { id: "032", path: "/images/soul/032.jpg", name: "Portrait Man", tags: ["Earth", "social"] },
  { id: "033", path: "/images/soul/033.jpg", name: "Friends Laugh", tags: ["Earth", "joy", "social"] },
  { id: "034", path: "/images/soul/034.jpg", name: "Family Happy", tags: ["Earth", "joy", "social"] },
  { id: "035", path: "/images/soul/035.jpg", name: "Couple Love", tags: ["Earth", "joy", "social"] },
  { id: "036", path: "/images/soul/036.jpg", name: "Happy Celebration", tags: ["Earth", "joy"] },
  { id: "037", path: "/images/soul/037.jpg", name: "Children Play", tags: ["Earth", "joy", "social"] },
  { id: "038", path: "/images/soul/038.jpg", name: "People Smile", tags: ["Earth", "joy", "social"] },
  { id: "039", path: "/images/soul/039.jpg", name: "Crowd Festival", tags: ["Earth", "joy", "energy"] },
  { id: "040", path: "/images/soul/040.jpg", name: "Success Achievement", tags: ["Earth", "energy", "joy"] },
  { id: "041", path: "/images/soul/041.jpg", name: "Moon Night", tags: ["Water", "mystery", "calm"] },
  { id: "042", path: "/images/soul/042.jpg", name: "Stars Sky", tags: ["Water", "mystery", "calm"] },
  { id: "043", path: "/images/soul/043.jpg", name: "Galaxy Space", tags: ["Water", "mystery"] },
  { id: "044", path: "/images/soul/044.jpg", name: "Rain Window", tags: ["Water", "calm", "mystery"] },
  { id: "045", path: "/images/soul/045.jpg", name: "Storm Clouds", tags: ["Water", "mystery", "energy"] },
  { id: "046", path: "/images/soul/046.jpg", name: "Fog Forest", tags: ["Water", "mystery", "nature"] },
  { id: "047", path: "/images/soul/047.jpg", name: "Desert Sand", tags: ["Water", "nature", "energy"] },
  { id: "048", path: "/images/soul/048.jpg", name: "Snow Winter", tags: ["Water", "calm", "nature"] },
  { id: "049", path: "/images/soul/049.jpg", name: "Autumn Leaves", tags: ["Water", "nature", "warm"] },
  { id: "050", path: "/images/soul/050.jpg", name: "Spring Flowers", tags: ["Water", "nature", "healing"] },
];

/**
 * Get image path by ID.
 */
export function getSoulImagePath(imageId: string | null): string | null {
  if (!imageId) return null;
  const image = SOUL_IMAGES.find(img => img.id === imageId);
  return image?.path || null;
}

/**
 * Pick a random image (with fallback).
 */
export function getRandomSoulImage(): SoulImageConfig | null {
  const allImages = SOUL_IMAGES.length > 0 ? SOUL_IMAGES : DEFAULT_FALLBACK_IMAGES;
  if (allImages.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * allImages.length);
  return allImages[randomIndex];
}

/**
 * Filter images by tag.
 */
export function getSoulImagesByTag(tag: string): SoulImageConfig[] {
  return SOUL_IMAGES.filter(img => img.tags?.includes(tag));
}

/**
 * Get all images (with fallback).
 */
export function getAllSoulImages(): SoulImageConfig[] {
  return SOUL_IMAGES.length > 0 ? SOUL_IMAGES : DEFAULT_FALLBACK_IMAGES;
}

const ELEMENT_TAG_ALIASES: Record<string, string[]> = {
  fire: ["energy", "warm", "joy", "fire"],
  wind: ["creative", "social", "wind"],
  void: ["mystery", "void"],
  earth: ["nature", "focus", "earth"],
  water: ["calm", "healing", "water"],
};

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function filterSoulImages(filters: SoulImageFilter): SoulImageConfig[] {
  const allImages = getAllSoulImages();
  const elementTags = (filters.elementTags ?? []).map(normalizeTag).filter(Boolean);
  const userIds = (filters.userIds ?? []).map(String).filter(Boolean);

  if (elementTags.length === 0 && userIds.length === 0) {
    if (allImages.length === 0) return [];
    const randomIndex = Math.floor(Math.random() * allImages.length);
    return [allImages[randomIndex]];
  }

  return allImages.filter((image) => {
    const imageTags = (image.tags ?? []).map(normalizeTag);
    const imageElementTags = (image.elementTags ?? []).map(normalizeTag);
    const imageUserIds = (image.userIds ?? []).map(String);

    const matchesUser = userIds.length === 0 || imageUserIds.some((id) => userIds.includes(id));
    const matchesElement =
      elementTags.length === 0 ||
      elementTags.some((tag) => {
        if (imageElementTags.includes(tag) || imageTags.includes(tag)) return true;
        const aliases = ELEMENT_TAG_ALIASES[tag] ?? [];
        return aliases.some((alias) => imageTags.includes(alias) || imageElementTags.includes(alias));
      });

    return matchesUser && matchesElement;
  });
}


