const proxy = require('http-proxy-middleware').createProxyMiddleware;

const target = 'http://localhost:8080'

//   process.env.NODE_ENV === 'production'
//     ? process.env.REACT_APP_PROD_SERVER
//     : process.env.REACT_APP_DEV_SERVER;
// const targetSockets =
//   process.env.NODE_ENV === 'production'
//     ? process.env.REACT_APP_PROD_SERVER_WS
//     : process.env.REACT_APP_DEV_SERVER_WS;

module.exports = function (app) {
  // app.use(proxy(`/auth/**`, {target}));
  app.use(proxy(`/api/**`, {target, changeOrigin: true}));
//   app.use(
//     proxy('/socket.io/**', {
//       target: targetSockets,
//       logLevel: 'debug',
//     }),
//   );
};