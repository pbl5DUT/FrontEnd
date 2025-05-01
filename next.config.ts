/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Tắt strictMode để tránh useEffect chạy hai lần trong development
  swcMinify: true,
  experimental: {
    // Nếu bạn đang sử dụng app router
    appDir: true,
  },
  // Thêm header để tránh vấn đề về CORS nếu cần
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
