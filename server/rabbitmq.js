const amqp = require('amqplib');

/**
 * RabbitMQ Connection Manager
 * Gerencia conexão e publicação de eventos
 */
class RabbitMQService {
  constructor() {
    this.connection = null;
    this.channel = null;
    this.exchange = 'task_events';
  }

  /**
   * Conectar ao RabbitMQ
   */
  async connect() {
    try {
      // Conectar ao RabbitMQ (Docker: localhost:5672)
      this.connection = await amqp.connect('amqp://localhost:5672');
      this.channel = await this.connection.createChannel();

      // Criar exchange tipo 'topic' para routing patterns
      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true
      });

      console.log('🐇 RabbitMQ conectado com sucesso!');
      console.log(`📡 Exchange: ${this.exchange} (tipo: topic)`);
      
      // Tratar desconexão
      this.connection.on('error', (err) => {
        console.error('❌ Erro na conexão RabbitMQ:', err);
      });

      this.connection.on('close', () => {
        console.log('🔌 Conexão RabbitMQ fechada');
      });

      return true;
    } catch (error) {
      console.error('❌ Falha ao conectar RabbitMQ:', error.message);
      console.log('⚠️ Certifique-se que RabbitMQ está rodando: docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management');
      return false;
    }
  }

  /**
   * Publicar evento no exchange
   * @param {string} routingKey - Ex: 'task.completed', 'task.created'
   * @param {object} data - Payload do evento
   */
  async publish(routingKey, data) {
    if (!this.channel) {
      console.warn('⚠️ Canal RabbitMQ não disponível - evento não enviado');
      return false;
    }

    try {
      const message = {
        ...data,
        timestamp: new Date().toISOString(),
        eventId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      const sent = this.channel.publish(
        this.exchange,
        routingKey,
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          contentType: 'application/json'
        }
      );

      if (sent) {
        console.log(`📤 Evento publicado: ${routingKey}`);
        console.log(`   Data:`, JSON.stringify(message, null, 2));
      }

      return sent;
    } catch (error) {
      console.error('❌ Erro ao publicar evento:', error);
      return false;
    }
  }

  /**
   * Fechar conexão
   */
  async close() {
    try {
      if (this.channel) await this.channel.close();
      if (this.connection) await this.connection.close();
      console.log('🔌 RabbitMQ desconectado');
    } catch (error) {
      console.error('❌ Erro ao fechar RabbitMQ:', error);
    }
  }
}

// Singleton
const rabbitMQService = new RabbitMQService();

module.exports = rabbitMQService;
