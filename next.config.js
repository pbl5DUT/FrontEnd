const withTM = require('next-transpile-modules')([
  '@ant-design/icons',
  '@ant-design/icons-svg',
  'rc-util',
]);

/** @type {import('next').NextConfig} */
const nextConfig = withTM({
  async rewrites() {
    return [
      {
        source: "/api/users",
        destination: "https://backend-pbl5-134t.onrender.com/api/users",
      },
    ];
  }
});

module.exports = nextConfig;
