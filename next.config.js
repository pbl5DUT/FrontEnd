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
};