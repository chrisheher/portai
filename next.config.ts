/** @type {import('next').NextConfig} */
const RAGLIB_URL = process.env.RAGLIB_URL ?? 'http://localhost:5000';
const NEWS_ORACLE_URL = 'https://kernel-news-oracle.vercel.app';
const PARTS_DESK_URL = 'https://parts-desk-two.vercel.app';
const SENT_DEMO_URL = 'https://sent-demo.vercel.app';

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

  // The Blacksmith-tailored résumé, shared only by link: keep it out of search results,
  // and give it a sensible name when saved.
  async headers() {
    return [
      {
        source: '/blacksmith/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/blacksmith',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Content-Disposition', value: 'inline; filename="Chris-Heher-Resume-Blacksmith.pdf"' },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      // onlychr.is/blacksmith opens the résumé tailored for Blacksmith's Developer Marketer role.
      {
        source: '/blacksmith',
        destination: '/blacksmith/chris-heher-resume.pdf',
      },
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
      // "The old books saw it coming", at /old-books (the old /kernel-news-oracle paths still work)
      {
        source: '/old-books',
        destination: `${NEWS_ORACLE_URL}/`,
      },
      {
        source: '/old-books/:path*',
        destination: `${NEWS_ORACLE_URL}/:path*`,
      },
      {
        source: '/kernel-news-oracle',
        destination: `${NEWS_ORACLE_URL}/`,
      },
      {
        source: '/kernel-news-oracle/:path*',
        destination: `${NEWS_ORACLE_URL}/:path*`,
      },
      // "Text dead authors about live news": the page, and its API under /dead-authors/
      // (the old /sent-demo paths still work)
      {
        source: '/dead-authors.html',
        destination: `${SENT_DEMO_URL}/`,
      },
      {
        source: '/dead-authors/:path*',
        destination: `${SENT_DEMO_URL}/:path*`,
      },
      {
        source: '/sent-demo.html',
        destination: `${SENT_DEMO_URL}/`,
      },
      {
        source: '/sent-demo/:path*',
        destination: `${SENT_DEMO_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
