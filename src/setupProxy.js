const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://127.0.0.1:8001/v1",
      changeOrigin: true,
    })
  );

  app.use(
    "/static/images/",
    createProxyMiddleware({
      target: "http://127.0.0.1:8001/static/images",
      changeOrigin: true,
    })
  );
};
