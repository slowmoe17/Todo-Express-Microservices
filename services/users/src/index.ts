import express from 'express';
import userRoutes from './routes/user.routes';
import { startGrpcServer } from './grpc/user.grpc';
import { initializeDatabase } from './database/init';

async function startServer(): Promise<void> {
  await initializeDatabase();

  const app = express();
  const PORT = process.env.PORT || '3001';

  app.use(express.json());
  app.use('/api/users', userRoutes);

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'users' });
  });

  app.listen(PORT, () => {
    console.log(`Users service running on port ${PORT}`);
  });

  startGrpcServer();
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

