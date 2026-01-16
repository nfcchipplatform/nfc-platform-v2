// src/lib/themeConfig.ts

export type ThemeConfig = {
  id: string;
  name: string;
  bgClass: string; // 背景色/グラデーション
  textClass: string; // メイン文字色
  accentColor: string; // アクセントカラー (HEX)
  pattern: "mandala" | "grid" | "none"; // 背景パターン
  fontClass: string; // フォントの種類
  elementColors: string[]; // 5本の指の色 (0:火, 1:風, 2:空, 3:地, 4:水)
};

// プリセットテーマの定義
export const THEMES: Record<string, ThemeConfig> = {
  // 1. デフォルト (女性向け/エレガント)
  default: {
    id: "default",
    name: "Elegant Mandala",
    bgClass: "bg-gradient-to-br from-indigo-50 via-white to-purple-50",
    textClass: "text-gray-800",
    accentColor: "#4F46E5", // Indigo
    pattern: "mandala",
    fontClass: "font-sans",
    elementColors: [
      "border-red-400 bg-red-50 text-red-500",      // 火
      "border-emerald-400 bg-emerald-50 text-emerald-500", // 風
      "border-violet-400 bg-violet-50 text-violet-500",   // 空
      "border-amber-400 bg-amber-50 text-amber-500",     // 地
      "border-cyan-400 bg-cyan-50 text-cyan-500",       // 水
    ],
  },
  // 2. 男性向け (サイバーパンク/ガジェット)
  cyber: {
    id: "cyber",
    name: "Cyber Neon",
    bgClass: "bg-gray-900",
    textClass: "text-gray-100",
    accentColor: "#00FFD1", // High-contrast Neon
    pattern: "grid",
    fontClass: "font-mono",
    elementColors: [
      "border-red-500 bg-gray-800 text-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]",    // 火
      "border-emerald-500 bg-gray-800 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]", // 風
      "border-violet-500 bg-gray-800 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.5)]",   // 空
      "border-yellow-500 bg-gray-800 text-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.5)]",    // 地
      "border-cyan-500 bg-gray-800 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]",      // 水
    ],
  },
  // 3. 和風 (Zen/高級サロン向け)
  zen: {
    id: "zen",
    name: "Zen Garden",
    bgClass: "bg-[#F5F5F0]", // 和紙っぽい色
    textClass: "text-stone-800",
    accentColor: "#0EA5E9", // High-contrast Sky
    pattern: "none",
    fontClass: "font-serif",
    elementColors: [
      "border-red-800 bg-stone-100 text-red-900", // 火
      "border-green-800 bg-stone-100 text-green-900", // 風
      "border-stone-800 bg-stone-200 text-stone-900", // 空
      "border-yellow-800 bg-stone-100 text-yellow-900", // 地
      "border-blue-800 bg-stone-100 text-blue-900", // 水
    ],
  },
};

// テーマ取得ヘルパー
export function getTheme(themeId: string | null | undefined): ThemeConfig {
  return THEMES[themeId || "default"] || THEMES["default"];
}