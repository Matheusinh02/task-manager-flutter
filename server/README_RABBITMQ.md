# 🐇 RabbitMQ - Guia Rápido

## 🚀 Iniciar RabbitMQ

```bash
# Docker
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Management UI
http://localhost:15672
User: guest / Pass: guest
```

## 📁 Arquivos

- **`rabbitmq.js`** - Serviço de conexão e publicação
- **`notification-worker.js`** - Consumer A (notificações)
- **`analytics-worker.js`** - Consumer B (analytics)
- **`server.js`** - API com endpoints de checkout

## 🎯 Executar Demonstração

### Terminal 1: API Server
```bash
node server.js
```

### Terminal 2: Notification Worker
```bash
node notification-worker.js
```

### Terminal 3: Analytics Worker
```bash
node analytics-worker.js
```

### Terminal 4: Testar Checkout
```bash
# Criar tarefas
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Teste", "priority": "high", "userId": "user1"}'

# Executar checkout
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1"}'
```

## 📊 Verificar Resultados

- **API:** Status 202 Accepted
- **Notification Worker:** Log de email enviado
- **Analytics Worker:** Dashboard atualizado
- **RabbitMQ UI:** http://localhost:15672 (mensagens processadas)
- **Analytics HTTP:** http://localhost:3001/dashboard

## 🔧 Troubleshooting

```bash
# Ver containers Docker
docker ps

# Logs do RabbitMQ
docker logs rabbitmq

# Reiniciar RabbitMQ
docker restart rabbitmq
```
