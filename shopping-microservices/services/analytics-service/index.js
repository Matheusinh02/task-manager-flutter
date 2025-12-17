const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
const EXCHANGE_NAME = 'shopping_events';
const QUEUE_NAME = 'analytics_queue';
const ROUTING_KEY = 'list.checkout.#';

// Armazenar estatísticas
const stats = {
  totalCheckouts: 0,
  totalRevenue: 0,
  checkoutsByUser: {},
  averageTicket: 0
};

async function startConsumer() {
  try {
    // Conectar ao RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    console.log('🐇 Analytics Service conectado ao RabbitMQ');

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

    console.log(`📊 Aguardando mensagens na fila: ${QUEUE_NAME}`);
    console.log(`🔑 Routing Key Pattern: ${ROUTING_KEY}\n`);

    // Consumir mensagens
    channel.consume(QUEUE_NAME, (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        const data = content.data;

        // Atualizar estatísticas
        stats.totalCheckouts++;
        stats.totalRevenue += data.totalAmount;
        
        if (!stats.checkoutsByUser[data.userId]) {
          stats.checkoutsByUser[data.userId] = {
            userName: data.userName,
            count: 0,
            totalSpent: 0
          };
        }
        
        stats.checkoutsByUser[data.userId].count++;
        stats.checkoutsByUser[data.userId].totalSpent += data.totalAmount;
        stats.averageTicket = stats.totalRevenue / stats.totalCheckouts;

        console.log('═══════════════════════════════════════════════════════════');
        console.log('📊 CONSUMER B - ANALYTICS SERVICE');
        console.log('═══════════════════════════════════════════════════════════');
        console.log(`⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}`);
        console.log(`📝 Evento: ${content.eventType}`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('💹 CÁLCULO DE ANALYTICS:');
        console.log(`   📋 Lista ID: ${data.listId}`);
        console.log(`   💰 Valor da compra: R$ ${data.totalAmount.toFixed(2)}`);
        console.log(`   📦 Quantidade de itens: ${data.items.length}`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('📈 ESTATÍSTICAS GLOBAIS:');
        console.log(`   🛒 Total de Checkouts: ${stats.totalCheckouts}`);
        console.log(`   💵 Faturamento Total: R$ ${stats.totalRevenue.toFixed(2)}`);
        console.log(`   📊 Ticket Médio: R$ ${stats.averageTicket.toFixed(2)}`);
        console.log(`   👥 Usuários Ativos: ${Object.keys(stats.checkoutsByUser).length}`);
        console.log('───────────────────────────────────────────────────────────');
        console.log('👤 TOP COMPRADORES:');
        
        // Mostrar top 3 compradores
        const topBuyers = Object.entries(stats.checkoutsByUser)
          .sort((a, b) => b[1].totalSpent - a[1].totalSpent)
          .slice(0, 3);
        
        topBuyers.forEach(([userId, data], index) => {
          console.log(`   ${index + 1}. ${data.userName}: R$ ${data.totalSpent.toFixed(2)} (${data.count} compras)`);
        });
        
        console.log('═══════════════════════════════════════════════════════════\n');

        // Simular atualização de dashboard
        setTimeout(() => {
          console.log(`✅ Dashboard atualizado com sucesso\n`);
          // Confirmar processamento (ACK)
          channel.ack(msg);
        }, 800);
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

console.log('🚀 Analytics Service iniciado');
console.log('📊 Calculando estatísticas de vendas...\n');
