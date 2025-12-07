import 'dotenv/config';
import { rabbitMQConsumer } from './consumers/rabbitmq.consumer';

async function startService(): Promise<void> {
  const PORT = process.env.PORT || '3003';

  try {
    // Connect to RabbitMQ
    await rabbitMQConsumer.connect();

    // Start consuming messages
    await rabbitMQConsumer.startConsuming();

    console.log(`Mail notification service running on port ${PORT}`);
    console.log('Waiting for messages...');
  } catch (error) {
    console.error('Failed to start mail notification service:', error);
    process.exit(1);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await rabbitMQConsumer.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await rabbitMQConsumer.close();
    process.exit(0);
  });
}

startService().catch((error) => {
  console.error('Failed to start service:', error);
  process.exit(1);
});

