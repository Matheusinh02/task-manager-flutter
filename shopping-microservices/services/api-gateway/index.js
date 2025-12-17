const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      user: 'http://localhost:3001',
      list: 'http://localhost:3002',
      item: 'http://localhost:3003'
    }
  });
});

// Proxy para User Service
app.use('/api/users', createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': '/users'
  }
}));

// Proxy para List Service
app.use('/api/lists', createProxyMiddleware({
  target: process.env.LIST_SERVICE_URL || 'http://list-service:3002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/lists': '/lists'
  }
}));

// Proxy para Item Service
app.use('/api/items', createProxyMiddleware({
  target: process.env.ITEM_SERVICE_URL || 'http://item-service:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/items': '/items'
  }
}));

app.listen(PORT, () => {
  console.log('════════════════════════════════════════════════════════');
  console.log(`🚪 API Gateway rodando na porta ${PORT}`);
  console.log('════════════════════════════════════════════════════════');
  console.log('📍 Rotas disponíveis:');
  console.log(`   GET    http://localhost:${PORT}/health`);
  console.log(`   *      http://localhost:${PORT}/api/users/*`);
  console.log(`   *      http://localhost:${PORT}/api/lists/*`);
  console.log(`   *      http://localhost:${PORT}/api/items/*`);
  console.log('════════════════════════════════════════════════════════\n');
});
