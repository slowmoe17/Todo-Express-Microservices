import express from 'express';
import todoRoutes from './routes/todo.routes';
import { initializeDatabase } from './database/init';
import { todoStatusPublisher } from './clients/rabbitmq.publisher';

async function startServer(): Promise<void> {
  await initializeDatabase();

  // Initialize RabbitMQ connections
  try {
    await todoStatusPublisher.connect();
    // Add other publishers here as needed
    // await notificationPublisher.connect();
  } catch (error) {
    console.error('Failed to connect to RabbitMQ. Continuing without message queue...', error);
  }

  const app = express();
  const PORT = process.env.PORT || '3002';

  app.use(express.json());
  app.use('/api/todos', todoRoutes);

  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'todos',
      rabbitmq: {
        todoStatusQueue: todoStatusPublisher.isConnected() ? 'connected' : 'disconnected',
        // Add other queues here as needed
      },
    });
  });

  app.listen(PORT, () => {
    console.log(`Todos service running on port ${PORT}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await todoStatusPublisher.close();
    // Close other publishers here as needed
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await todoStatusPublisher.close();
    // Close other publishers here as needed
    process.exit(0);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

