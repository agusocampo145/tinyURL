import { redis } from '../config/redis';
import { generateCode } from '../utils/generateCode';
import { accessQueue } from '../queues/accessQueue';
import { CreateUrlDto, AccessEvent } from '../types';
import { UrlRepository } from '../repositories/urlRepository';
import { AppError } from '../middlewares/errorHandler';

const CACHE_TTL = 3600;

export class UrlService {
  constructor(private readonly urlRepository: UrlRepository) {}

  async createShortUrl(dto: CreateUrlDto): Promise<string> {
    const code = dto.alias ?? await this.generateUniqueCode();

    if (dto.alias) {
      const exists = await this.urlRepository.existsByCode(dto.alias);
      if (exists) throw new AppError('Alias already in use', 409);
    }

    await this.urlRepository.create(dto.originalUrl, code);
    await redis.set(code, dto.originalUrl, 'EX', CACHE_TTL);

    return `${process.env.BASE_URL}/${code}`;
  }

  async resolveUrl(code: string, ip: string, userAgent: string): Promise<string> {
    const cached = await redis.get(code);
    const originalUrl = cached ?? await this.resolveFromDb(code);

    await this.enqueueAccessEvent({ code, ip, userAgent, date: new Date() });

    return originalUrl;
  }

  private async resolveFromDb(code: string): Promise<string> {
    const url = await this.urlRepository.findByCode(code);
    if (!url) throw new AppError('URL not found', 404);

    await redis.set(code, url.originalUrl, 'EX', CACHE_TTL);
    return url.originalUrl;
  }

  private async generateUniqueCode(): Promise<string> {
    let code = generateCode();
    while (await this.urlRepository.existsByCode(code)) {
      code = generateCode();
    }
    return code;
  }

  private async enqueueAccessEvent(event: AccessEvent): Promise<void> {
    await accessQueue.add('access', event);
  }
}
