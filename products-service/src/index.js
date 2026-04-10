const express = require('express');
const app = express();
app.use(express.json());

const products = [
  { id: 1, name: 'Laptop', price: 999 },
  { id: 2, name: 'Phone', price: 499 },
  { id: 3, name: 'Headphones', price: 199 },
];

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'products' }));
app.get('/products', (req, res) => res.json(products));
app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Products service running on port ${PORT}`));
