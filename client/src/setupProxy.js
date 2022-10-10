const proxy = require('http-proxy-middleware').createProxyMiddleware;

const target = 'http://localhost:8080';

module.exports = function (app) {
  app.use(proxy(`/api/**`, { target, changeOrigin: true }));
};
