import { Worker } from 'bullmq';
import { AccessEvent } from '../types';
import { AccessLogRepository } from '../repositories/accessLogRepository';

const accessLogRepository = new AccessLogRepository();

// Worker para procesar eventos de acceso en segundo plano
export const accessWorker = new Worker(
  'access-events',
  async (job) => {
    const event: AccessEvent = job.data;
    // Timeout para poder testear en local el funcionamiento de la encolacion asincrona, en local es muy rapido el procesamiento y no se nota la diferencia.
    //await new Promise(resolve => setTimeout(resolve, 3000));
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
