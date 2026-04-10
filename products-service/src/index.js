const express = require('express');
const client = require('prom-client');
const app = express();
app.use(express.json());

// Prometheus metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequests = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
});

const products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Phone', price: 499 },
  { id: 3, name: 'Headphones', price: 199 },
];

app.get('/health', (req, res) => {
  httpRequests.inc({ method: 'GET', route: '/health', status: 200 });
  res.json({ status: 'ok', service: 'products' });
});

app.get('/products', (req, res) => {
  httpRequests.inc({ method: 'GET', route: '/products', status: 200 });
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) {
    httpRequests.inc({ method: 'GET', route: '/products/:id', status: 404 });
    return res.status(404).json({ error: 'Not found' });
  }
  httpRequests.inc({ method: 'GET', route: '/products/:id', status: 200 });
  res.json(product);
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Products service running on port ${PORT}`));
