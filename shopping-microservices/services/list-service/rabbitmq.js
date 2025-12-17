const amqp = require('amqplib');

class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
    this.EXCHANGE_NAME = 'shopping_events';
  }

  async connect() {
    try {
      this.connection = await amqp.connect(this.RABBITMQ_URL);
      this.channel = await this.connection.createChannel();
      
      // Criar exchange do tipo 'topic'
      await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', {
        durable: true
      });

      console.log('🐇 Conectado ao RabbitMQ');
      
      // Listener para reconexão
      this.connection.on('error', (err) => {
        console.error('❌ Erro na conexão RabbitMQ:', err);
      });

      this.connection.on('close', () => {
        console.log('⚠️ Conexão RabbitMQ fechada. Tentando reconectar...');
        setTimeout(() => this.connect(), 5000);
      });

    } catch (error) {
      console.error('❌ Erro ao conectar RabbitMQ:', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publishCheckoutEvent(listData) {
    if (!this.channel) {
      console.error('❌ Canal RabbitMQ não disponível');
      return false;
    }

    try {
      const message = {
        eventType: 'list.checkout.completed',
        timestamp: new Date().toISOString(),
        data: listData
      };

      const routingKey = 'list.checkout.completed';
      
      this.channel.publish(
        this.EXCHANGE_NAME,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true }
      );

      console.log(`📤 Evento publicado: ${routingKey}`, message);
      return true;
    } catch (error) {
      console.error('❌ Erro ao publicar mensagem:', error);
      return false;
    }
  }

  async close() {
    try {
      await this.channel?.close();
      await this.connection?.close();
    } catch (error) {
      console.error('Erro ao fechar conexão:', error);
    }
  }
}

module.exports = new RabbitMQService();
