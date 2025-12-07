import * as amqp from 'amqplib';
import { TodoStatusUpdateMessage, TodoStatus } from '../types/todo.types';
import { EmailContext } from '../types/email.types';
import { emailStrategyFactory } from '../strategies/email-strategy-factory';

export class RabbitMQConsumer {
  private connectionModel: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;
  private readonly queueName: string;
  private readonly exchangeName: string;
  private readonly routingKey: string;

  constructor() {
    this.queueName = process.env.RABBITMQ_TODO_STATUS_QUEUE || 'todo_status_updates';
    this.exchangeName = process.env.RABBITMQ_EXCHANGE_NAME || 'todo_exchange';
    this.routingKey = process.env.RABBITMQ_TODO_STATUS_ROUTING_KEY || 'todo.status.update';
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

      // Assert exchange
      await this.channel.assertExchange(this.exchangeName, 'topic', {
        durable: true,
      });

      // Assert queue
      await this.channel.assertQueue(this.queueName, {
        durable: true,
      });

      // Bind queue to exchange
      await this.channel.bindQueue(this.queueName, this.exchangeName, this.routingKey);

      // Set prefetch to process one message at a time
      await this.channel.prefetch(1);

      console.log(`RabbitMQ consumer connected - Queue: ${this.queueName}, Exchange: ${this.exchangeName}, Routing Key: ${this.routingKey}`);
    } catch (error) {
      console.error(`Failed to connect to RabbitMQ queue ${this.queueName}:`, error);
      throw error;
    }
  }

  async startConsuming(): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }

    try {
      await this.channel.consume(
        this.queueName,
        async (message) => {
          if (!message) {
            return;
          }

          try {
            const content = message.content.toString();
            const todoStatusUpdate: TodoStatusUpdateMessage = JSON.parse(content);

            console.log(`Received task status update:`, {
              todoId: todoStatusUpdate.todoId,
              userId: todoStatusUpdate.userId,
              status: todoStatusUpdate.status,
            });

            // Process the message
            await this.processMessage(todoStatusUpdate);

            // Acknowledge message after successful processing
            this.channel!.ack(message);
            console.log(`Successfully processed and acknowledged message for todo ${todoStatusUpdate.todoId}`);
          } catch (error) {
            console.error('Error processing message:', error);
            // Reject message and don't requeue (to avoid infinite loop)
            this.channel!.nack(message, false, false);
          }
        },
        {
          noAck: false, // Manual acknowledgment
        },
      );

      console.log(`Started consuming messages from queue: ${this.queueName}`);
    } catch (error) {
      console.error('Failed to start consuming messages:', error);
      throw error;
    }
  }

  private async processMessage(message: TodoStatusUpdateMessage): Promise<void> {
    try {
      // Get the appropriate email strategy based on status
      const strategy = emailStrategyFactory.getStrategy(message.status as TodoStatus);

      // Build email context
      // Note: In a real scenario, you might want to fetch user email and todo title
      // from a database or another service. For now, we'll use placeholder data.
      const emailContext: EmailContext = {
        todoId: message.todoId,
        userId: message.userId,
        status: message.status,
        updatedAt: message.updatedAt,
        userEmail: process.env.DEFAULT_USER_EMAIL || `user-${message.userId}@example.com`, // TODO: Fetch from user service
        userName: `User ${message.userId}`, // TODO: Fetch from user service
        todoTitle: `Task ${message.todoId}`, // TODO: Fetch from todo service
      };

      // Send email using the strategy
      await strategy.send(emailContext);
      console.log(`Email sent successfully for todo ${message.todoId} with status ${message.status}`);
    } catch (error) {
      console.error(`Failed to process message for todo ${message.todoId}:`, error);
      throw error;
    }
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
      console.log('RabbitMQ consumer connection closed');
    } catch (error) {
      console.error('Error closing RabbitMQ connection:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.channel !== null && this.connectionModel !== null;
  }
}

export const rabbitMQConsumer = new RabbitMQConsumer();



