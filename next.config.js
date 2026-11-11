/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // HSTS is intentionally absent: Vercel already sends
  // Strict-Transport-Security for the production domain.
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        // Our Supabase project's public storage (product images, donation
        // photos). Pinned to this project rather than `*.supabase.co`: a
        // wildcard would let anyone point /_next/image at their own Supabase
        // bucket and spend our image-optimization quota resizing their files.
        protocol: 'https',
        hostname: 'edvnhzbfgoxqlurktumb.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
}

module.exports = nextConfig
