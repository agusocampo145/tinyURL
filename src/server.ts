import 'dotenv/config';
import { connectDB } from './config/db';
import process from 'process';
import { accessWorker } from './queues/acessWorker';
import app from './app';


const PORT = process.env.PORT ?? 3000;

const start = async (): Promise<void> => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  process.on('SIGTERM', async () => {
    await accessWorker.close();
    process.exit(0);
  });
};

start();
