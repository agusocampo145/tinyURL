import { Queue } from 'bullmq';

export const accessQueue = new Queue('access-events', {
  connection: {
    host: process.env.REDIS_HOST as string,
    port: Number(process.env.REDIS_PORT),
  },
  defaultJobOptions: {
    // 2 retries con backoff exponencial de 1 segundo
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});
