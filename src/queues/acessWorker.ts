import { Worker } from 'bullmq';
import { AccessEvent } from '../types';
import { AccessLogRepository } from '../repositories/accessLogRepository';

const accessLogRepository = new AccessLogRepository();

// Worker para procesar eventos de acceso en segundo plano
export const accessWorker = new Worker(
  'access-events',
  async (job) => {
    const event: AccessEvent = job.data;
    await accessLogRepository.create({
      code: event.code,
      ip: event.ip,
      userAgent: event.userAgent,
    });
  },
  {
    connection: {
      host: process.env.REDIS_HOST as string,
      port: Number(process.env.REDIS_PORT),
    },
  }
);

accessWorker.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});
