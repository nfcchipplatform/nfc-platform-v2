// src/constants/soulData.ts
export const POINT_COUNT = 100;
export const AURA_COLORS = ["#22d3ee", "#6366f1", "#f43f5e", "#f59e0b", "#10b981"];
export const PURPLE_AURA_COLOR = "#a855f7";

export interface NailPoint {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  br: string;
}

export const NAIL_CONFIG: NailPoint[] = [
  { id: "thumb",  x: 54.06, y: 63.36, w: 7.7, h: 12.4, r: -124, br: "45% 45% 20% 20%" },
  { id: "index",  x: 56.27, y: 51.23, w: 7.6, h: 9.7,  r: 161,  br: "45% 45% 20% 20%" },
  { id: "middle", x: 44.79, y: 53.38, w: 8.0, h: 10.1, r: 164,  br: "45% 45% 20% 20%" },
  { id: "ring",   x: 33.76, y: 55.04, w: 7.7, h: 10.0, r: 167,  br: "45% 45% 20% 20%" },
  { id: "pinky",  x: 25.15, y: 54.71, w: 6.3, h: 9.0,  r: 159,  br: "45% 45% 20% 20%" },
];

export const SHAPE_LIBRARY: Record<string, (t: number) => { x: number, y: number }> = {
  CIRCLE: (t: number) => {
    const a = t * Math.PI * 2 - Math.PI / 2;
    return { x: 0.5 + Math.cos(a) * 0.25, y: 0.5 + Math.sin(a) * 0.25 };
  },
  TRIANGLE: (t: number) => {
    const s = Math.floor(t * 3); const lt = (t * 3) % 1;
    const v = [[0.5, 0.3], [0.75, 0.7], [0.25, 0.7], [0.5, 0.3]];
    return { x: v[s][0] + (v[s+1][0] - v[s][0]) * lt, y: v[s][1] + (v[s+1][1] - v[s][1]) * lt };
  },
  SQUARE: (t: number) => {
    const s = Math.floor(t * 4); const lt = (t * 4) % 1;
    const v = [[0.3, 0.3], [0.7, 0.3], [0.7, 0.7], [0.3, 0.7], [0.3, 0.3]];
    return { x: v[s][0] + (v[s+1][0] - v[s][0]) * lt, y: v[s][1] + (v[s+1][1] - v[s][1]) * lt };
  },
  STAR: (t: number) => {
    const a = t * Math.PI * 2 - Math.PI / 2;
    const r = (Math.floor(t * 10) % 2 === 0) ? 0.3 : 0.12;
    return { x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r };
  }
};