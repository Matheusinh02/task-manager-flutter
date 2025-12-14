const amqp = require('amqplib');

/**
 * CONSUMER A: Notification Service
 * Processa eventos de checkout para enviar notificações
 */

const RABBITMQ_URL = 'amqp://localhost:5672';
const EXCHANGE = 'task_events';
const QUEUE = 'notification_queue';
const ROUTING_PATTERN = 'task.checkout.#';  // Escuta todos eventos de checkout

async function startNotificationConsumer() {
  try {
    console.log('🔔 =====================================');
    console.log('🔔 NOTIFICATION SERVICE');
    console.log('🔔 Iniciando consumer...');
    console.log('🔔 =====================================\n');

    // 1. Conectar ao RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    console.log('✅ Conectado ao RabbitMQ');

    // 2. Criar/verificar exchange
    await channel.assertExchange(EXCHANGE, 'topic', { durable: true });
    console.log(`📡 Exchange: ${EXCHANGE} (topic)`);

    // 3. Criar fila exclusiva para este consumer
    const queue = await channel.assertQueue(QUEUE, {
      durable: true,
      exclusive: false
    });
    console.log(`📥 Fila criada: ${QUEUE}`);

    // 4. Fazer binding da fila ao exchange com routing pattern
    await channel.bindQueue(queue.queue, EXCHANGE, ROUTING_PATTERN);
    console.log(`🔗 Binding: ${ROUTING_PATTERN} → ${QUEUE}`);

    // 5. Configurar prefetch (processar 1 mensagem por vez)
    channel.prefetch(1);

    console.log('\n⏳ Aguardando eventos de checkout...\n');

    // 6. Consumir mensagens
    channel.consume(queue.queue, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📬 NOVO EVENTO RECEBIDO');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log(`⏰ Timestamp: ${event.timestamp}`);
          console.log(`🔑 Event ID: ${event.eventId}`);
          console.log(`👤 User ID: ${event.userId}`);
          console.log(`📊 Total de Tarefas: ${event.totalTasks}`);
          console.log(`📋 Resumo por Prioridade:`);
          console.log(`   🔴 Urgente: ${event.summary.urgent}`);
          console.log(`   🟠 Alta: ${event.summary.high}`);
          console.log(`   🟡 Média: ${event.summary.medium}`);
          console.log(`   🟢 Baixa: ${event.summary.low}`);
          
          // SIMULAR ENVIO DE NOTIFICAÇÃO/EMAIL
          console.log('\n📧 Processando notificação...');
          await simulateSendNotification(event);
          
          console.log('✅ Notificação enviada com sucesso!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
          
          // ACK (confirmar processamento)
          channel.ack(msg);
          
        } catch (error) {
          console.error('❌ Erro ao processar mensagem:', error);
          
          // NACK e requeue (se der erro, reprocessa)
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
      setTimeout(startNotificationConsumer, 5000);
    });

  } catch (error) {
    console.error('❌ Falha ao iniciar consumer:', error.message);
    console.log('\n⚠️  Certifique-se que RabbitMQ está rodando:');
    console.log('   docker run -d -p 5672:5672 -p 15672:15672 --name rabbitmq rabbitmq:3-management\n');
    process.exit(1);
  }
}

/**
 * Simula envio de notificação por email/push
 * Em produção, integraria com SendGrid, Firebase, etc.
 */
async function simulateSendNotification(event) {
  return new Promise((resolve) => {
    // Simular delay de processamento (envio real de email)
    setTimeout(() => {
      console.log(`📤 Email enviado para: user-${event.userId}@example.com`);
      console.log(`📱 Push notification enviado`);
      console.log(`💬 Mensagem: "Parabéns! Você completou ${event.totalTasks} tarefas!"`);
      resolve();
    }, 1000);  // 1 segundo de delay
  });
}

// Iniciar consumer
console.log('🚀 Starting Notification Service...\n');
startNotificationConsumer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando Notification Service...');
  process.exit(0);
});
