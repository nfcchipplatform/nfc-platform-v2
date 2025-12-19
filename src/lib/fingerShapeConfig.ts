// src/lib/fingerShapeConfig.ts

import { CSSProperties } from "react";

export type FingerShapeConfig = {
  id: string;
  name: string;
  className: string;
  style: CSSProperties;
  width: string;
  height: string;
};

export const FINGER_SHAPES: Record<string, FingerShapeConfig> = {
  circle: {
    id: "circle",
    name: "円形",
    className: "rounded-full",
    style: {},
    width: "w-16",
    height: "h-16",
  },
  nailTip: {
    id: "nailTip",
    name: "ネイルチップ",
    className: "",
    style: {
      clipPath: 'ellipse(48% 50% at 50% 42%)',
      borderRadius: '50% 50% 50% 50% / 15% 15% 80% 80%',
      boxShadow: '1px 2px 5px rgba(0, 0, 0, 0.15)'
    },
    width: "w-16",
    height: "h-20",
  },
  // 他の形状も追加可能
  // square: { ... },
  // heart: { ... },
};

export function getFingerShape(shapeId: string = "circle"): FingerShapeConfig {
  return FINGER_SHAPES[shapeId] || FINGER_SHAPES["circle"];
}
