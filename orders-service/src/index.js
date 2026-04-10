const express = require('express');
const client = require('prom-client');
const app = express();
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const orders = [];

app.get('/health', (req, res) => {
  httpRequests.inc({ method: 'GET', route: '/health', status: 200 });
  res.json({ status: 'ok', service: 'orders' });
});

app.post('/orders', (req, res) => {
  const { productId, quantity, userId } = req.body;
  if (!productId || !quantity) {
    httpRequests.inc({ method: 'POST', route: '/orders', status: 400 });
    return res.status(400).json({ error: 'productId and quantity required' });
  }
  const order = {
    id: orders.length + 1,
    productId, quantity, userId,
    status: 'pending',
    createdAt: new Date()
  };
  orders.push(order);
  httpRequests.inc({ method: 'POST', route: '/orders', status: 201 });
  res.status(201).json(order);
});

app.get('/orders', (req, res) => {
  httpRequests.inc({ method: 'GET', route: '/orders', status: 200 });
  res.json(orders);
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Orders service running on port ${PORT}`));
