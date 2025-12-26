# 画像管理システム

魂の中に表示する画像とネイルのTOP画像を管理するシステムです。

## フォルダ構造

```
public/
  images/
    soul/          # 魂の中に表示する画像（100枚程度を想定）
    nails/         # ネイルのTOP画像
```

## 画像の追加方法

### 1. 魂の中に表示する画像を追加

1. 画像ファイルを `public/images/soul/` フォルダに配置
   - 例: `image1.jpg`, `image2.jpg`, `image3.png` など

2. `src/lib/soulImageConfig.ts` の `SOUL_IMAGES` 配列に追加
   ```typescript
   export const SOUL_IMAGES: SoulImageConfig[] = [
     { id: "1", path: "/images/soul/image1.jpg", name: "画像1", tags: ["default"] },
     { id: "2", path: "/images/soul/image2.jpg", name: "画像2", tags: ["default"] },
     // ... 追加していく
   ];
   ```

### 2. ネイルのTOP画像を追加

1. 画像ファイルを `public/images/nails/` フォルダに配置
   - 例: `top1.jpg`, `top2.jpg` など

2. `src/lib/nailImageConfig.ts` の `NAIL_TOP_IMAGES` 配列に追加
   ```typescript
   export const NAIL_TOP_IMAGES: NailTopImageConfig[] = [
     { id: "1", path: "/images/nails/top1.jpg", name: "トップ画像1", fingerId: "thumb", tags: ["default"] },
     { id: "2", path: "/images/nails/top2.jpg", name: "トップ画像2", fingerId: "index", tags: ["default"] },
     // ... 追加していく
   ];
   ```

## 表示アルゴリズムのカスタマイズ

表示アルゴリズムは `src/lib/soulImageDisplayAlgorithm.ts` で管理されています。

### 現在のアルゴリズムタイプ

- `random`: ランダムに選択（デフォルト）
- `sequential`: 順番に表示（未実装）
- `by-shape`: 形状に応じて選択（未実装）
- `custom`: カスタムアルゴリズム（未実装）

### アルゴリズムの変更方法

`src/lib/soulImageDisplayAlgorithm.ts` の `selectSoulImage` 関数を編集してください。

```typescript
export function selectSoulImage(
  config: ImageDisplayConfig,
  currentShape: string,
  currentPhase: "LOADING" | "STANDBY" | "PRESSED"
): SoulImageConfig | null {
  // ここにアルゴリズムを実装
}
```

## InteractiveHandコンポーネントへの統合

`InteractiveHand`コンポーネントで画像表示を有効にするには：

1. `useSoulAnimation` を `useSoulAnimationWithImage` に変更
2. 画像表示設定を渡す

```typescript
import { useSoulAnimationWithImage } from "../hooks/useSoulAnimationWithImage";
import { ImageDisplayConfig } from "../lib/soulImageDisplayAlgorithm";

const imageDisplayConfig: ImageDisplayConfig = {
  algorithm: "random",
  enabled: true, // 画像表示を有効にする
};

const { canvasRef, targetType, triggerExplosion, isExploding } = 
  useSoulAnimationWithImage(phase, imageDisplayConfig);
```

## ネイルのTOP画像の表示

ネイルのTOP画像を表示するには、`InteractiveHand`コンポーネントのネイルチップ層で画像を重ねて表示します。

実装は後で追加予定です。

