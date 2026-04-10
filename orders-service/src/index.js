const express = require('express');
const app = express();
app.use(express.json());

const orders = [];

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'orders' }));
app.post('/orders', (req, res) => {
  const { productId, quantity, userId } = req.body;
  if (!productId || !quantity) return res.status(400).json({ error: 'productId and quantity required' });
  const order = { id: orders.length + 1, productId, quantity, userId, status: 'pending', createdAt: new Date() };
  orders.push(order);
  res.status(201).json(order);
});
app.get('/orders', (req, res) => res.json(orders));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Orders service running on port ${PORT}`));
