const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'shopping_events';
const QUEUE_NAME = 'notification_queue';
const ROUTING_KEY = 'list.checkout.#';

async function startConsumer() {
  try {
    // Conectar ao RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    console.log('🐇 Notification Service conectado ao RabbitMQ');

    // Garantir que o exchange existe
    await channel.assertExchange(EXCHANGE_NAME, 'topic', {
      durable: true
    });

    // Criar fila
    await channel.assertQueue(QUEUE_NAME, {
      durable: true
    });

    // Bind da fila ao exchange com routing key pattern
    await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

    console.log(`📬 Aguardando mensagens na fila: ${QUEUE_NAME}`);
    console.log(`🔑 Routing Key Pattern: ${ROUTING_KEY}\n`);

    // Consumir mensagens
    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        
        console.log('═══════════════════════════════════════════════════════════');
        console.log('📧 CONSUMER A - NOTIFICATION SERVICE');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}`);
        console.log(`📝 Evento: ${content.eventType}`);
        console.log('───────────────────────────────────────────────────────────');
        console.log(`✉️  Enviando comprovante da lista [${content.data.listId}] para o usuário [${content.data.userEmail}]`);
        console.log('───────────────────────────────────────────────────────────');
        console.log(`👤 Usuário: ${content.data.userName}`);
        console.log(`📋 Lista: ${content.data.listName}`);
        console.log(`💰 Total: R$ ${content.data.totalAmount.toFixed(2)}`);
        console.log(`📦 Itens: ${content.data.items.length}`);
        console.log('═══════════════════════════════════════════════════════════\n');

        // Simular processamento
        setTimeout(() => {
          console.log(`✅ Email enviado com sucesso para ${content.data.userEmail}\n`);
          // Confirmar processamento (ACK)
          channel.ack(msg);
        }, 1000);
      }
    }, {
      noAck: false // Requer confirmação manual
    });

    // Tratamento de erros
    connection.on('error', (err) => {
      console.error('❌ Erro na conexão:', err);
    });

    connection.on('close', () => {
      console.log('⚠️ Conexão fechada. Tentando reconectar...');
      setTimeout(startConsumer, 5000);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar consumer:', error);
    setTimeout(startConsumer, 5000);
  }
}

// Iniciar consumer
startConsumer();

console.log('🚀 Notification Service iniciado');
console.log('📬 Escutando eventos de checkout...\n');
