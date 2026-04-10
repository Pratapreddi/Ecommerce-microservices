const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'gateway' }));

app.use('/products', createProxyMiddleware({
  target: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3001',
  changeOrigin: true,
}));

app.use('/orders', createProxyMiddleware({
  target: process.env.ORDERS_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
