# 🐇 Roteiro de Demonstração - RabbitMQ (Mensageria Assíncrona)

**Pontuação:** 15 Pontos  
**Objetivo:** Demonstrar comunicação assíncrona entre microsserviços usando RabbitMQ

---

## 📋 Pré-requisitos

### 1. Docker Desktop Instalado
```bash
# Verificar Docker
docker --version
```

### 2. Node.js e Dependências
```bash
cd server
npm install amqplib
```

---

## 🚀 PARTE 1: Setup do RabbitMQ

### Passo 1.1: Iniciar RabbitMQ com Docker

```bash
# Rodar RabbitMQ com Management UI
docker run -d \
  --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3-management

# Aguardar ~10 segundos para inicializar
```

**Windows PowerShell:**
```powershell
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Passo 1.2: Acessar RabbitMQ Management

Abrir navegador em: **http://localhost:15672**

- **Usuário:** `guest`
- **Senha:** `guest`

✅ **Verificar:**
- Interface web abre
- 0 Connections
- 0 Channels
- 0 Queues

---

## 🎯 PARTE 2: Arquitetura do Sistema

### Componentes:

```
┌────────────────────────────────────────────────────────┐
│                     API SERVER                         │
│               (Producer/Publisher)                     │
│                                                        │
│  POST /api/checkout                                    │
│    ↓                                                   │
│  1. Completa tarefas pendentes                         │
│  2. Publica evento no RabbitMQ                         │
│  3. Retorna 202 Accepted (imediato)                   │
└──────────────────┬─────────────────────────────────────┘
                   │
                   ↓ Exchange: "task_events" (topic)
                   │ Routing Key: "task.checkout.completed"
                   │
         ┌─────────┴─────────┐
         │                   │
         ↓                   ↓
┌────────────────┐  ┌────────────────┐
│  CONSUMER A    │  │  CONSUMER B    │
│  Notification  │  │  Analytics     │
│    Service     │  │    Service     │
│                │  │                │
│  📧 Envia      │  │  📊 Calcula    │
│  email/push    │  │  estatísticas  │
└────────────────┘  └────────────────┘
```

### Exchange: `task_events` (tipo: topic)
- **Routing Key:** `task.checkout.completed`
- **Durable:** true
- **Type:** topic (permite routing patterns)

### Consumers:
1. **Notification Service** → Fila: `notification_queue`
2. **Analytics Service** → Fila: `analytics_queue`

Ambos escutam: `task.checkout.#`

---

## 🎬 PARTE 3: Demonstração ao Vivo

### Passo 3.1: Iniciar API Server

**Terminal 1:**
```bash
cd server
node server.js
```

**Saída esperada:**
```
🚀 =====================================
🚀 Servidor Offline-First iniciado
🚀 Porta: 3000
🚀 URL: http://localhost:3000
🚀 Recursos:
🚀   - Sync incremental
🚀   - Controle de versão
🚀   - Detecção de conflitos
🚀 =====================================
🐇 RabbitMQ conectado com sucesso!
📡 Exchange: task_events (tipo: topic)
```

### Passo 3.2: Iniciar Consumer A (Notification)

**Terminal 2:**
```bash
cd server
node notification-worker.js
```

**Saída esperada:**
```
🚀 Starting Notification Service...

🔔 =====================================
🔔 NOTIFICATION SERVICE
🔔 Iniciando consumer...
🔔 =====================================

✅ Conectado ao RabbitMQ
📡 Exchange: task_events (topic)
📥 Fila criada: notification_queue
🔗 Binding: task.checkout.# → notification_queue

⏳ Aguardando eventos de checkout...
```

### Passo 3.3: Iniciar Consumer B (Analytics)

**Terminal 3:**
```bash
cd server
node analytics-worker.js
```

**Saída esperada:**
```
🚀 Starting Analytics Service...

📊 =====================================
📊 ANALYTICS SERVICE
📊 Iniciando consumer...
📊 =====================================

✅ Conectado ao RabbitMQ
📡 Exchange: task_events (topic)
📥 Fila criada: analytics_queue
🔗 Binding: task.checkout.# → analytics_queue
🌐 Dashboard HTTP disponível em: http://localhost:3001/dashboard

⏳ Aguardando eventos para análise...
```

### Passo 3.4: Verificar RabbitMQ Management

Atualizar **http://localhost:15672**

✅ **Deve mostrar:**
- **Connections:** 3 (API + 2 consumers)
- **Channels:** 3
- **Exchanges:** `task_events` (topic)
- **Queues:** 
  - `notification_queue` (ready: 0)
  - `analytics_queue` (ready: 0)

---

## 🎯 PARTE 4: Executar Checkout (Evento Principal)

### Passo 4.1: Criar Tarefas de Teste

**Postman/cURL - Terminal 4:**

```bash
# Criar 5 tarefas pendentes
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Comprar leite",
    "description": "Leite integral 1L",
    "priority": "high",
    "userId": "user1"
  }'

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Estudar Flutter",
    "priority": "medium",
    "userId": "user1"
  }'

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Fazer exercícios",
    "priority": "urgent",
    "userId": "user1"
  }'

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Reunião às 15h",
    "priority": "high",
    "userId": "user1"
  }'

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ligar para cliente",
    "priority": "low",
    "userId": "user1"
  }'
```

### Passo 4.2: Executar CHECKOUT

```bash
# CHECKOUT: Completar todas tarefas pendentes
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1"}'
```

---

## ✅ PARTE 5: Evidências (Mostrar ao Professor)

### Evidência 1: API Respondeu Rápido

**Terminal 4 (cURL):**
```json
{
  "success": true,
  "message": "Checkout iniciado - processamento assíncrono em andamento",
  "totalCompleted": 5,
  "checkoutId": "2025-12-13T20:30:00.000Z"
}
```

🎯 **Status Code:** `202 Accepted` (processamento assíncrono)  
⚡ **Tempo de resposta:** < 100ms

### Evidência 2: Notification Consumer Processou

**Terminal 2 (Notification Service):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 NOVO EVENTO RECEBIDO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Timestamp: 2025-12-13T20:30:00.000Z
🔑 Event ID: 1702500000-abc123xyz
👤 User ID: user1
📊 Total de Tarefas: 5
📋 Resumo por Prioridade:
   🔴 Urgente: 1
   🟠 Alta: 2
   🟡 Média: 1
   🟢 Baixa: 1

📧 Processando notificação...
📤 Email enviado para: user-user1@example.com
📱 Push notification enviado
💬 Mensagem: "Parabéns! Você completou 5 tarefas!"
✅ Notificação enviada com sucesso!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Evidência 3: Analytics Consumer Atualizou Dashboard

**Terminal 3 (Analytics Service):**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 PROCESSANDO ANALYTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏰ Timestamp: 2025-12-13T20:30:00.000Z
🔑 Event ID: 1702500000-abc123xyz
💾 Estatísticas atualizadas no banco de dados
📊 Dashboard atualizado

╔═══════════════════════════════════════╗
║       📊 DASHBOARD ANALYTICS         ║
╠═══════════════════════════════════════╣
║ Total de Checkouts: 1                 ║
║ Total de Tarefas:   5                 ║
╠═══════════════════════════════════════╣
║ POR PRIORIDADE:                      ║
║   🔴 Urgente: 1                       ║
║   🟠 Alta:    2                       ║
║   🟡 Média:   1                       ║
║   🟢 Baixa:   1                       ║
╠═══════════════════════════════════════╣
║ ÚLTIMOS CHECKOUTS:                   ║
║ 1. [20:30:00] User: user1            ║
║    Tarefas: 5                        ║
╚═══════════════════════════════════════╝
✅ Analytics processado!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Evidência 4: RabbitMQ Management

**Abrir:** http://localhost:15672

#### Aba "Overview":
- **Messages Published:** +1
- **Messages Delivered:** +2 (1 para cada consumer)
- **Messages Acknowledged:** +2

#### Aba "Queues":
- `notification_queue`: 
  - Messages: 0 (processada)
  - Ack: 1
  - Rate: ~X msg/s
- `analytics_queue`:
  - Messages: 0 (processada)
  - Ack: 1
  - Rate: ~X msg/s

#### Aba "Exchanges":
- `task_events` (topic):
  - Messages Published: 1
  - Publish rate: mostrar gráfico

#### Gráficos:
- **Message rates** → Pico no momento do checkout
- **Queuing rates** → Subiu e desceu (ack)

---

## 🎯 PARTE 6: Teste Múltiplos Checkouts (Demonstração Avançada)

### Executar 3 checkouts seguidos:

```bash
# Checkout 1
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1"}'

# Criar mais tarefas
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Nova tarefa 1", "priority": "high", "userId": "user1"}'

curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Nova tarefa 2", "priority": "medium", "userId": "user1"}'

# Checkout 2
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1"}'

# Mais tarefas
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Nova tarefa 3", "priority": "urgent", "userId": "user1"}'

# Checkout 3
curl -X POST http://localhost:3000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"userId": "user1"}'
```

**Verificar:**
- ✅ Todos consumers processaram 3 mensagens
- ✅ Dashboard analytics mostra 3 checkouts
- ✅ RabbitMQ Management mostra 6 mensagens (3 x 2 consumers)

---

## 📊 PARTE 7: Dashboard Analytics (HTTP)

**Acessar:** http://localhost:3001/dashboard

```json
{
  "success": true,
  "analytics": {
    "totalCheckouts": 3,
    "totalTasksCompleted": 8,
    "checkoutHistory": [
      {
        "timestamp": "2025-12-13T20:32:00.000Z",
        "userId": "user1",
        "totalTasks": 1
      },
      {
        "timestamp": "2025-12-13T20:31:00.000Z",
        "userId": "user1",
        "totalTasks": 2
      },
      {
        "timestamp": "2025-12-13T20:30:00.000Z",
        "userId": "user1",
        "totalTasks": 5
      }
    ],
    "priorityStats": {
      "urgent": 2,
      "high": 3,
      "medium": 2,
      "low": 1
    }
  }
}
```

---

## 🎓 Conceitos Demonstrados

### 1. **Publisher/Subscriber Pattern**
```javascript
// Producer (API)
rabbitMQ.publish('task.checkout.completed', data);

// Consumer A
channel.consume('notification_queue', handler);

// Consumer B
channel.consume('analytics_queue', handler);
```

### 2. **Desacoplamento**
- API não sabe quem consome os eventos
- Consumers podem ser adicionados/removidos sem impactar API
- Processamento assíncrono = API responde rápido

### 3. **Topic Exchange + Routing Keys**
```
Routing Key: "task.checkout.completed"
Pattern: "task.checkout.#"

Permite filtros flexíveis:
- "task.#" → Todos eventos de task
- "task.checkout.#" → Apenas checkouts
- "task.*.completed" → Todos completions
```

### 4. **Durabilidade e Confiabilidade**
- **Durable Exchange:** Persiste após restart
- **Durable Queues:** Mensagens não perdem
- **ACK Manual:** Consumer confirma processamento
- **NACK + Requeue:** Reprocessa em caso de erro

### 5. **Escalabilidade**
- Multiple Consumers → Distribuição de carga
- Cada consumer processa de forma independente
- Fácil adicionar novos serviços

---

## 🐛 Troubleshooting

### Problema: "RabbitMQ connection refused"

```bash
# Verificar se RabbitMQ está rodando
docker ps | grep rabbitmq

# Se não estiver, iniciar:
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# Verificar logs
docker logs rabbitmq
```

### Problema: Consumer não recebe mensagens

```bash
# 1. Verificar se fila foi criada
# Management UI → Queues

# 2. Verificar binding
# Management UI → Exchanges → task_events → Bindings

# 3. Verificar consumer está conectado
# Management UI → Connections
```

### Problema: Mensagens ficam na fila

```
Causa: Consumer não fez ACK

Solução: Verificar se processamento teve erro
```

---

## ✅ Checklist de Validação

### Setup:
- [ ] RabbitMQ rodando no Docker
- [ ] Management UI acessível (localhost:15672)
- [ ] Exchange `task_events` criado
- [ ] 2 Queues criadas (notification + analytics)

### Funcionamento:
- [ ] API responde 202 Accepted
- [ ] Notification consumer recebe evento
- [ ] Analytics consumer recebe evento
- [ ] Dashboard analytics atualiza
- [ ] RabbitMQ Management mostra gráficos

### RabbitMQ Management:
- [ ] Messages published aumenta
- [ ] Messages delivered = 2x published
- [ ] Messages ack = delivered
- [ ] Queues ficam vazias (processadas)
- [ ] Gráfico mostra pico

---

## 📝 Script de Demonstração (5 Minutos)

### Ordem de Execução:

1. **[1 min]** Mostrar RabbitMQ Management zerado
2. **[30s]** Iniciar 3 terminais (API + 2 consumers)
3. **[30s]** Criar 5 tarefas de teste
4. **[1 min]** Executar POST /api/checkout
5. **[2 min]** Mostrar evidências:
   - API respondeu rápido
   - Notification consumer logou
   - Analytics atualizou dashboard
   - RabbitMQ Management: gráficos

---

## 🏆 Critérios de Avaliação (15 Pontos)

### Implementação Técnica (8 pontos):
- [3] Producer publica no exchange correto
- [2] Consumer A processa e loga
- [2] Consumer B calcula estatísticas
- [1] Routing keys corretos

### Evidências (4 pontos):
- [1] API responde 202 Accepted
- [1] Consumers processam instantaneamente
- [2] RabbitMQ Management mostra gráficos

### Apresentação (3 pontos):
- [1] Explicação clara do fluxo
- [1] Demonstração fluida
- [1] Troubleshooting (se necessário)

---

## 🎉 Conclusão

Sistema demonstra:
- ✅ **Mensageria assíncrona** com RabbitMQ
- ✅ **Desacoplamento** entre serviços
- ✅ **Escalabilidade** (múltiplos consumers)
- ✅ **Confiabilidade** (ACK, durabilidade)
- ✅ **Observabilidade** (Management UI)

**RABBITMQ 100% FUNCIONAL!** 🐇📨✨
