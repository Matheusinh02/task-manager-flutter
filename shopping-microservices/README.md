# 🐇 Sistema de Mensageria com RabbitMQ - Lista de Compras

Sistema de microsserviços demonstrando mensageria assíncrona com RabbitMQ para processamento de checkout de listas de compras.

## 📋 Arquitetura

```
┌─────────────────┐
│   API Gateway   │ :3000
└────────┬────────┘
         │
    ┌────┴────┬─────────┬─────────┐
    │         │         │         │
┌───▼───┐ ┌──▼───┐ ┌───▼───┐ ┌───▼───────┐
│ User  │ │ List │ │ Item  │ │ RabbitMQ  │
│Service│ │Service│ │Service│ │ Management│
│ :3001 │ │ :3002 │ │ :3003 │ │   :15672  │
└───────┘ └───┬───┘ └───────┘ └─────┬─────┘
              │                     │
              │   Publish Event     │
              └────────────────────►│
                                    │
              ┌─────────────────────┴─────────────┐
              │                                   │
        ┌─────▼──────┐                   ┌───────▼──────┐
        │Notification│                   │  Analytics   │
        │  Service   │                   │   Service    │
        │(Consumer A)│                   │ (Consumer B) │
        └────────────┘                   └──────────────┘
```

## 🎯 Funcionalidades

### Producer (List Service)
- Endpoint `POST /lists/:id/checkout` que publica evento assíncrono
- Exchange: `shopping_events` (tipo: topic)
- Routing Key: `list.checkout.completed`
- Retorna **202 Accepted** imediatamente

### Consumer A (Notification Service)
- Escuta fila `notification_queue` com pattern `list.checkout.#`
- Simula envio de email/comprovante para o usuário
- Loga: _"Enviando comprovante da lista [ID] para o usuário [EMAIL]"_

### Consumer B (Analytics Service)
- Escuta fila `analytics_queue` com pattern `list.checkout.#`
- Calcula estatísticas em tempo real:
  - Total de checkouts
  - Faturamento total
  - Ticket médio
  - Top compradores

## 🚀 Setup e Execução

### Opção 1: Com Docker (Recomendado)

```powershell
# 1. Iniciar todos os serviços com Docker Compose
cd shopping-microservices
docker-compose up --build

# Os serviços estarão disponíveis em:
# - API Gateway: http://localhost:3000
# - User Service: http://localhost:3001
# - List Service: http://localhost:3002
# - Item Service: http://localhost:3003
# - RabbitMQ Management: http://localhost:15672 (admin/admin123)
```

### Opção 2: Desenvolvimento Local

```powershell
# 1. Instalar RabbitMQ localmente
# Download: https://www.rabbitmq.com/download.html
# Ou usar Docker apenas para RabbitMQ:
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.12-management-alpine

# 2. Instalar dependências em todos os serviços
cd shopping-microservices
npm run install:all

# 3. Iniciar cada serviço em terminais separados

# Terminal 1: User Service
cd services/user-service
npm run dev

# Terminal 2: List Service (Producer)
cd services/list-service
npm run dev

# Terminal 3: Item Service
cd services/item-service
npm run dev

# Terminal 4: Notification Service (Consumer A)
cd services/notification-service
npm run dev

# Terminal 5: Analytics Service (Consumer B)
cd services/analytics-service
npm run dev

# Terminal 6: API Gateway
cd services/api-gateway
npm run dev
```

## 🎬 Demonstração em Sala de Aula

### 1. Preparação
```powershell
# Abrir RabbitMQ Management UI
start http://localhost:15672
# Login: admin / admin123

# Verificar que está zerado (sem mensagens)
```

### 2. Disparo do Checkout

```powershell
# Teste com PowerShell
$body = @{} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/lists/1/checkout" -Method POST -Body $body -ContentType "application/json"
```

Ou com curl:
```bash
curl -X POST http://localhost:3000/api/lists/1/checkout
```

### 3. Evidências

**✅ No Terminal da API/List Service:**
```
📤 Evento publicado: list.checkout.completed
```

**✅ No Terminal do Notification Service:**
```
═══════════════════════════════════════════════════════════
📧 CONSUMER A - NOTIFICATION SERVICE
═══════════════════════════════════════════════════════════
✉️  Enviando comprovante da lista [1] para o usuário [joao@email.com]
👤 Usuário: João Silva
💰 Total: R$ 77.30
✅ Email enviado com sucesso
```

**✅ No Terminal do Analytics Service:**
```
═══════════════════════════════════════════════════════════
📊 CONSUMER B - ANALYTICS SERVICE
═══════════════════════════════════════════════════════════
💹 CÁLCULO DE ANALYTICS:
   💰 Valor da compra: R$ 77.30
📈 ESTATÍSTICAS GLOBAIS:
   🛒 Total de Checkouts: 1
   💵 Faturamento Total: R$ 77.30
   📊 Ticket Médio: R$ 77.30
```

**✅ No RabbitMQ Management UI:**
- Ver gráfico de mensagens publicadas
- Ver filas `notification_queue` e `analytics_queue`
- Ver mensagens sendo processadas (ACK)

## 📊 Endpoints Disponíveis

### API Gateway (http://localhost:3000)

```
GET    /health                      # Status dos serviços
GET    /api/users                   # Listar usuários
GET    /api/users/:id               # Buscar usuário
POST   /api/users                   # Criar usuário

GET    /api/lists                   # Listar listas
GET    /api/lists/:id               # Buscar lista
POST   /api/lists                   # Criar lista
POST   /api/lists/:id/checkout      # 🎯 FINALIZAR LISTA (RabbitMQ)

GET    /api/items                   # Listar itens
GET    /api/items/:id               # Buscar item
POST   /api/items                   # Criar item
```

## 🧪 Scripts de Teste

### Teste Completo do Fluxo

```powershell
# 1. Buscar listas disponíveis
Invoke-RestMethod -Uri "http://localhost:3000/api/lists"

# 2. Fazer checkout da lista 1
$response = Invoke-RestMethod -Uri "http://localhost:3000/api/lists/1/checkout" -Method POST -ContentType "application/json" -Body "{}"
$response

# Resposta esperada:
# {
#   "message": "Checkout iniciado com sucesso",
#   "listId": 1,
#   "status": "processing",
#   "totalAmount": 77.30
# }

# 3. Fazer checkout da lista 2
Invoke-RestMethod -Uri "http://localhost:3000/api/lists/2/checkout" -Method POST -ContentType "application/json" -Body "{}"

# 4. Observar os consumers processando em paralelo
```

### Criar Nova Lista e Fazer Checkout

```powershell
# Criar nova lista
$newList = @{
    userId = 1
    name = "Compras de Emergência"
    items = @(
        @{ itemId = 1; quantity = 1; price = 25.90 },
        @{ itemId = 3; quantity = 2; price = 4.20 }
    )
} | ConvertTo-Json

$list = Invoke-RestMethod -Uri "http://localhost:3000/api/lists" -Method POST -Body $newList -ContentType "application/json"

# Fazer checkout
Invoke-RestMethod -Uri "http://localhost:3000/api/lists/$($list.id)/checkout" -Method POST -ContentType "application/json" -Body "{}"
```

## 🔍 Monitoramento

### RabbitMQ Management UI
Acesse: http://localhost:15672
- **Usuário:** admin
- **Senha:** admin123

**Visualizar:**
- Overview: Gráficos de mensagens
- Exchanges: `shopping_events` (topic)
- Queues: `notification_queue`, `analytics_queue`
- Connections: Serviços conectados

## 🛠️ Tecnologias

- **Node.js** v18+
- **Express** - Framework web
- **RabbitMQ** - Message broker
- **amqplib** - Cliente RabbitMQ para Node.js
- **Docker** - Containerização
- **Docker Compose** - Orquestração

## 📦 Estrutura do Projeto

```
shopping-microservices/
├── services/
│   ├── user-service/           # Gerenciamento de usuários
│   ├── list-service/           # Listas + RabbitMQ Producer
│   ├── item-service/           # Catálogo de itens
│   ├── notification-service/   # Consumer A (notificações)
│   ├── analytics-service/      # Consumer B (analytics)
│   └── api-gateway/            # Gateway de API
├── docker-compose.yml
├── package.json
└── README.md
```

## 🎓 Conceitos Demonstrados

✅ **Mensageria Assíncrona** - Desacoplamento de serviços  
✅ **Event-Driven Architecture** - Comunicação por eventos  
✅ **Topic Exchange** - Roteamento flexível com routing keys  
✅ **Multiple Consumers** - Dois consumers processando a mesma mensagem  
✅ **Message Acknowledgment** - ACK manual para garantir processamento  
✅ **Resiliência** - Reconexão automática em caso de falhas  
✅ **Observabilidade** - RabbitMQ Management UI  

## 🚨 Troubleshooting

### RabbitMQ não conecta
```powershell
# Verificar se o RabbitMQ está rodando
docker ps | Select-String rabbitmq

# Ver logs
docker logs shopping-rabbitmq
```

### Consumer não recebe mensagens
```powershell
# Verificar no RabbitMQ Management UI:
# 1. Exchange 'shopping_events' existe?
# 2. Filas estão criadas e bound ao exchange?
# 3. Consumers estão conectados?
```

### Porta em uso
```powershell
# Verificar portas em uso
netstat -ano | Select-String ":3000|:3001|:3002|:3003|:5672|:15672"

# Parar todos os containers
docker-compose down
```

## 📝 Notas da Implementação

- **202 Accepted**: API retorna imediatamente, processamento é assíncrono
- **Persistência**: Mensagens são persistentes (durable: true)
- **ACK Manual**: Consumers confirmam processamento explicitamente
- **Routing Pattern**: `list.checkout.#` captura todos eventos de checkout
- **Idempotência**: Consumers devem ser preparados para reprocessar mensagens

## 🎯 Critérios de Avaliação Atendidos

✅ Producer publica em `shopping_events` com routing key `list.checkout.completed`  
✅ Endpoint retorna 202 Accepted imediatamente  
✅ Consumer A loga notificação de email  
✅ Consumer B calcula analytics e estatísticas  
✅ RabbitMQ Management UI funcional  
✅ Demonstração completa do fluxo  

---

**Desenvolvido para demonstração de Mensageria com RabbitMQ (15 Pontos)**
