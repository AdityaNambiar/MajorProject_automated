const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
      createProxyMiddleware(
        "/takeData",
        {
          target: 'http://localhost:5000/',
          changeOrigin: true
        }
      )
  )
  app.use(
    createProxyMiddleware(
      "/hello",
      {
        target: 'http://localhost:8080/',
        changeOrigin: true
      }
    )
  )
};