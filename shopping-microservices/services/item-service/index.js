const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Mock de itens
const items = [
  { id: 1, name: 'Arroz 5kg', price: 25.90, category: 'Alimentos' },
  { id: 2, name: 'Feijão 1kg', price: 8.50, category: 'Alimentos' },
  { id: 3, name: 'Leite 1L', price: 4.20, category: 'Laticínios' },
  { id: 4, name: 'Pão Francês', price: 12.00, category: 'Padaria' }
];

// GET /items
app.get('/items', (req, res) => {
  res.json(items);
});

// GET /items/:id
app.get('/items/:id', (req, res) => {
  const item = items.find(i => i.id === parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: 'Item não encontrado' });
  res.json(item);
});

// POST /items
app.post('/items', (req, res) => {
  const newItem = {
    id: items.length + 1,
    name: req.body.name,
    price: req.body.price,
    category: req.body.category
  };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.listen(PORT, () => {
  console.log(`📦 Item Service rodando na porta ${PORT}`);
});
