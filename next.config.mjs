/** @type {import('next').NextConfig} */
const nextConfig = {
  // 画像最適化の設定
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    // Cloudinaryなどの外部画像ドメインを許可
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
    ],
  },
  
  // 実験的な機能: Partial Prerendering (Next.js 14+)
  experimental: {
    // サーバーコンポーネントのストリーミングを有効化
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // 圧縮設定
  compress: true,
  
  // 本番環境でのソースマップ無効化（バンドルサイズ削減）
  productionBrowserSourceMaps: false,
  
  // ヘッダー設定（キャッシュ最適化）
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
      {
        // 静的アセットの長期キャッシュ
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
