/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5006/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
