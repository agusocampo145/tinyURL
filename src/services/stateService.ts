import { AccessLogRepository } from '../repositories/accessLogRepository';
import { UrlRepository } from '../repositories/urlRepository';
import { StatsResponse } from '../types';

export class StatsService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly accessLogRepository: AccessLogRepository
  ) {}

  async getStats(code: string): Promise<StatsResponse> {
    const url = await this.urlRepository.findByCode(code);
    if (!url) throw new Error('URL not found');

    const [totalClicks, lastLog] = await Promise.all([
        // 1era decision un for iterativo sumando, luego optimizado.
      this.accessLogRepository.countByCode(code),
      this.accessLogRepository.findLastByCode(code),
    ]);

    return {
      code,
      totalClicks,
      lastClick: lastLog?.accessedAt ?? null,
    };
  }
}
