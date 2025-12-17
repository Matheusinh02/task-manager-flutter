const express = require('express');
const cors = require('cors');
const axios = require('axios');
const rabbitmq = require('./rabbitmq');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Mock de listas de compras
const lists = [
  {
    id: 1,
    userId: 1,
    name: 'Compras da Semana',
    status: 'active',
    items: [
      { itemId: 1, quantity: 2, price: 25.90 },
      { itemId: 2, quantity: 3, price: 8.50 }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: 2,
    name: 'Feira do Mês',
    status: 'active',
    items: [
      { itemId: 3, quantity: 5, price: 4.20 },
      { itemId: 4, quantity: 10, price: 12.00 }
    ],
    createdAt: new Date().toISOString()
  }
];

// Conectar ao RabbitMQ na inicialização
rabbitmq.connect();

// GET /lists
app.get('/lists', (req, res) => {
  res.json(lists);
});

// GET /lists/:id
app.get('/lists/:id', (req, res) => {
  const list = lists.find(l => l.id === parseInt(req.params.id));
  if (!list) return res.status(404).json({ error: 'Lista não encontrada' });
  res.json(list);
});

// POST /lists
app.post('/lists', (req, res) => {
  const newList = {
    id: lists.length + 1,
    userId: req.body.userId,
    name: req.body.name,
    status: 'active',
    items: req.body.items || [],
    createdAt: new Date().toISOString()
  };
  lists.push(newList);
  res.status(201).json(newList);
});

// POST /lists/:id/checkout - ENDPOINT PRINCIPAL COM RABBITMQ
app.post('/lists/:id/checkout', async (req, res) => {
  const listId = parseInt(req.params.id);
  const list = lists.find(l => l.id === listId);
  
  if (!list) {
    return res.status(404).json({ error: 'Lista não encontrada' });
  }

  if (list.status === 'completed') {
    return res.status(400).json({ error: 'Lista já finalizada' });
  }

  // Buscar dados do usuário
  let userData = null;
  try {
    const userResponse = await axios.get(`http://localhost:3001/users/${list.userId}`);
    userData = userResponse.data;
  } catch (error) {
    console.warn('⚠️ Não foi possível buscar dados do usuário');
  }

  // Calcular total
  const totalAmount = list.items.reduce((sum, item) => {
    return sum + (item.quantity * item.price);
  }, 0);

  // Atualizar status da lista
  list.status = 'completed';
  list.completedAt = new Date().toISOString();
  list.totalAmount = totalAmount;

  // Publicar evento no RabbitMQ
  const checkoutData = {
    listId: list.id,
    userId: list.userId,
    userEmail: userData?.email || 'usuario@email.com',
    userName: userData?.name || 'Usuário',
    listName: list.name,
    items: list.items,
    totalAmount: totalAmount,
    completedAt: list.completedAt
  };

  await rabbitmq.publishCheckoutEvent(checkoutData);

  // Retornar 202 Accepted (processamento assíncrono)
  res.status(202).json({
    message: 'Checkout iniciado com sucesso',
    listId: list.id,
    status: 'processing',
    totalAmount: totalAmount
  });
});

app.listen(PORT, () => {
  console.log(`📝 List Service rodando na porta ${PORT}`);
});

// Fechar conexão ao encerrar
process.on('SIGINT', async () => {
  await rabbitmq.close();
  process.exit(0);
});
