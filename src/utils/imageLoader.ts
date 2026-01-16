// src/utils/imageLoader.ts

export function withCloudinaryParams(
  src: string,
  params: string = "f_auto,q_auto,w_400,dpr_auto"
): string {
  if (!src || !src.startsWith("http")) return src;
  return src.includes("?") ? `${src}&${params}` : `${src}?${params}`;
}

