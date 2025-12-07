import * as amqp from 'amqplib';

export interface TodoStatusUpdateMessage {
  todoId: string;
  userId: string;
  status: string;
  updatedAt: string;
}

/**
 * RabbitMQ Publisher - One queue per purpose
 * Exchange routes messages to queues based on routing keys
 * Architecture: Publisher → Exchange → (routing key) → Queue
 */
class RabbitMQPublisher {
  private connectionModel: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queueName: string;
  private readonly exchangeName: string;
  private readonly routingKey: string;

  constructor(queueName: string, routingKey: string, exchangeName?: string) {
    this.queueName = queueName;
    this.routingKey = routingKey;
    this.exchangeName = exchangeName || process.env.RABBITMQ_EXCHANGE_NAME || 'todo_exchange';
  }

  async connect(): Promise<void> {
    try {
      const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
      this.connectionModel = await amqp.connect(rabbitmqUrl);
      
      if (!this.connectionModel) {
        throw new Error('Failed to establish RabbitMQ connection');
      }
      
      this.channel = await this.connectionModel.createChannel();

      if (!this.channel) {
        throw new Error('Failed to create RabbitMQ channel');
      }

      // Assert exchange (topic exchange for flexible routing)
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true, // Exchange survives broker restart
      });

      // Assert queue (one queue per purpose)
      await this.channel.assertQueue(this.queueName, {
        durable: true, // Queue survives broker restart
      });

      // Bind queue to exchange with routing key
      // This determines which messages from exchange go to this queue
      await this.channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);

      console.log(`RabbitMQ publisher connected - Queue: ${this.queueName}, Exchange: ${this.exchangeName}, Routing Key: ${this.routingKey}`);
    } catch (error) {
      console.error(`Failed to connect to RabbitMQ queue ${this.queueName}:`, error);
      throw error;
    }
  }

  async publish<T = any>(message: T): Promise<boolean> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      // Publish to exchange with routing key
      // Exchange will route message to the correct queue based on routing key
      const published = this.channel.publish(
        this.exchangeName,
        this.routingKey,
        messageBuffer,
        {
          persistent: true, // Message survives broker restart
        },
      );

      if (published) {
        console.log(`Published message to exchange ${this.exchangeName} with routing key ${this.routingKey} → queue ${this.queueName}`);
        return true;
      } else {
        console.warn(`Message was not published to exchange ${this.exchangeName} (channel buffer full)`);
        return false;
      }
    } catch (error) {
      console.error(`Failed to publish message to exchange ${this.exchangeName}:`, error);
      throw error;
    }
  }

  async publishStatusUpdate(message: TodoStatusUpdateMessage): Promise<boolean> {
    const published = await this.publish(message);
    if (published) {
      console.log(`Published status update for todo ${message.todoId} with status ${message.status}`);
    }
    return published;
  }

  async close(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connectionModel) {
        await this.connectionModel.close();
        this.connectionModel = null;
      }
      console.log('RabbitMQ publisher connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.channel !== null && this.connectionModel !== null;
  }
}

/**
 * Publisher for task status updates
 * Queue: todo_status_updates
 * Routing Key: todo.status.update
 * Exchange: todo_exchange (shared)
 */
export const todoStatusPublisher = new RabbitMQPublisher(
  process.env.RABBITMQ_TODO_STATUS_QUEUE || 'todo_status_updates',
  process.env.RABBITMQ_TODO_STATUS_ROUTING_KEY || 'todo.status.update',
);

/**
 * Example: Create additional publishers for other purposes
 * Each publisher has its own dedicated queue and routing key
 * All publishers use the same exchange, but routing keys determine which queue receives the message
 * 
 * export const notificationPublisher = new RabbitMQPublisher(
 *   process.env.RABBITMQ_NOTIFICATION_QUEUE || 'notifications',
 *   process.env.RABBITMQ_NOTIFICATION_ROUTING_KEY || 'notification.send',
 * );
 * 
 * export const auditLogPublisher = new RabbitMQPublisher(
 *   process.env.RABBITMQ_AUDIT_LOG_QUEUE || 'audit_logs',
 *   process.env.RABBITMQ_AUDIT_LOG_ROUTING_KEY || 'audit.log.create',
 * );
 */

// Legacy export for backward compatibility
export const rabbitMQPublisher = todoStatusPublisher;

