const amqp = require('amqplib');

/**
 * CONSUMER B: Analytics Service
 * Calcula estatísticas e métricas dos checkouts
 */

const RABBITMQ_URL = 'amqp://localhost:5672';
const EXCHANGE = 'task_events';
const QUEUE = 'analytics_queue';
const ROUTING_PATTERN = 'task.checkout.#';  // Mesma routing key

// Armazenamento em memória (em produção seria banco de dados)
const analytics = {
  totalCheckouts: 0,
  totalTasksCompleted: 0,
  checkoutHistory: [],
  priorityStats: {
    urgent: 0,
    high: 0,
    medium: 0,
    low: 0
  }
};

async function startAnalyticsConsumer() {
  try {
    console.log('📊 =====================================');
    console.log('📊 ANALYTICS SERVICE');
    console.log('📊 Iniciando consumer...');
    console.log('📊 =====================================\n');

    // 1. Conectar ao RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    console.log('✅ Conectado ao RabbitMQ');

    // 2. Criar/verificar exchange
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log(`📡 Exchange: ${EXCHANGE} (topic)`);

    // 3. Criar fila exclusiva para analytics
    const queue = await channel.assertQueue(QUEUE, {
      durable: true,
      exclusive: false
    });
    console.log(`📥 Fila criada: ${QUEUE}`);

    // 4. Binding
    await channel.bindQueue(queue.queue, EXCHANGE, ROUTING_PATTERN);
    console.log(`🔗 Binding: ${ROUTING_PATTERN} → ${QUEUE}`);

    // 5. Prefetch
    channel.prefetch(1);

    console.log('\n⏳ Aguardando eventos para análise...\n');

    // 6. Consumir mensagens
    channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📈 PROCESSANDO ANALYTICS');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`⏰ Timestamp: ${event.timestamp}`);
          console.log(`🔑 Event ID: ${event.eventId}`);
          
          // CALCULAR ESTATÍSTICAS
          await processAnalytics(event);
          
          // Exibir dashboard atualizado
          displayDashboard();
          
          console.log('✅ Analytics processado!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          // ACK
          channel.ack(msg);
          
        } catch (error) {
          console.error('❌ Erro ao processar analytics:', error);
          channel.nack(msg, false, true);
        }
      }
    });

    // Tratar desconexão
    connection.on('error', (err) => {
      console.error('❌ Erro na conexão:', err);
      process.exit(1);
    });

    connection.on('close', () => {
      console.log('🔌 Conexão fechada - reconectando em 5s...');
      setTimeout(startAnalyticsConsumer, 5000);
    });

  } catch (error) {
    console.error('❌ Falha ao iniciar consumer:', error.message);
    console.log('\n⚠️  Certifique-se que RabbitMQ está rodando:');
    console.log('   docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management\n');
    process.exit(1);
  }
}

/**
 * Processar dados de analytics
 */
async function processAnalytics(event) {
  return new Promise((resolve) => {
    // Simular processamento (queries no banco, agregações, etc)
    setTimeout(() => {
      // Atualizar contadores
      analytics.totalCheckouts++;
      analytics.totalTasksCompleted += event.totalTasks;
      
      // Atualizar por prioridade
      analytics.priorityStats.urgent += event.summary.urgent;
      analytics.priorityStats.high += event.summary.high;
      analytics.priorityStats.medium += event.summary.medium;
      analytics.priorityStats.low += event.summary.low;
      
      // Salvar histórico (últimos 10)
      analytics.checkoutHistory.unshift({
        timestamp: event.timestamp,
        userId: event.userId,
        totalTasks: event.totalTasks
      });
      
      if (analytics.checkoutHistory.length > 10) {
        analytics.checkoutHistory.pop();
      }
      
      console.log('💾 Estatísticas atualizadas no banco de dados');
      console.log('📊 Dashboard atualizado');
      
      resolve();
    }, 800);  // Simular delay de processamento
  });
}

/**
 * Exibir dashboard de analytics
 */
function displayDashboard() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║       📊 DASHBOARD ANALYTICS         ║');
  console.log('╠═══════════════════════════════════════╣');
  console.log(`║ Total de Checkouts: ${analytics.totalCheckouts.toString().padEnd(18)}║`);
  console.log(`║ Total de Tarefas:   ${analytics.totalTasksCompleted.toString().padEnd(18)}║`);
  console.log('╠═══════════════════════════════════════╣');
  console.log('║ POR PRIORIDADE:                      ║');
  console.log(`║   🔴 Urgente: ${analytics.priorityStats.urgent.toString().padEnd(24)}║`);
  console.log(`║   🟠 Alta:    ${analytics.priorityStats.high.toString().padEnd(24)}║`);
  console.log(`║   🟡 Média:   ${analytics.priorityStats.medium.toString().padEnd(24)}║`);
  console.log(`║   🟢 Baixa:   ${analytics.priorityStats.low.toString().padEnd(24)}║`);
  console.log('╠═══════════════════════════════════════╣');
  console.log('║ ÚLTIMOS CHECKOUTS:                   ║');
  
  analytics.checkoutHistory.slice(0, 3).forEach((checkout, i) => {
    const time = new Date(checkout.timestamp).toLocaleTimeString('pt-BR');
    console.log(`║ ${i + 1}. [${time}] User: ${checkout.userId.padEnd(8)} ║`);
    console.log(`║    Tarefas: ${checkout.totalTasks.toString().padEnd(27)}║`);
  });
  
  console.log('╚═══════════════════════════════════════╝\n');
}

// Iniciar consumer
console.log('🚀 Starting Analytics Service...\n');
startAnalyticsConsumer();

// Endpoint HTTP simples para visualizar dashboard (opcional)
const express = require('express');
const app = express();

app.get('/dashboard', (req, res) => {
  res.json({
    success: true,
    analytics
  });
});

app.listen(3001, () => {
  console.log('🌐 Dashboard HTTP disponível em: http://localhost:3001/dashboard\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando Analytics Service...');
  process.exit(0);
});
