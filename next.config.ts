/** @type {import('next').NextConfig} */
const RAGLIB_URL = process.env.RAGLIB_URL ?? 'http://localhost:5000';
const NEWS_ORACLE_URL = 'https://kernel-news-oracle.vercel.app';
const PARTS_DESK_URL = 'https://parts-desk-two.vercel.app';

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'assets.aceternity.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'imgur.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'cdn.jsdelivr.net' },
    ],
  },

  async rewrites() {
    return [
      // Before /raglib/:path* so the parts desk wins over the raglib server.
      {
        source: '/raglib/parts',
        destination: `${PARTS_DESK_URL}/`,
      },
      {
        source: '/raglib/parts/:path*',
        destination: `${PARTS_DESK_URL}/:path*`,
      },
      {
        source: '/raglib',
        destination: `${RAGLIB_URL}/`,
      },
      {
        source: '/raglib/:path*',
        destination: `${RAGLIB_URL}/:path*`,
      },
      {
        source: '/kernel-news-oracle',
        destination: `${NEWS_ORACLE_URL}/`,
      },
      {
        source: '/kernel-news-oracle/:path*',
        destination: `${NEWS_ORACLE_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
