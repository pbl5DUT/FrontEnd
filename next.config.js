// filepath: c:\Users\melic\pbl5\next.config.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = {
  async rewrites() {
    return [
      {
        source: "/api/users",
        destination: "https://backend-pbl5-134t.onrender.com/api/users",
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'rc-util/es/Dom/canUseDom': require.resolve('./node_modules/rc-util/lib/Dom/canUseDom')
    };
    return config;
  }
};