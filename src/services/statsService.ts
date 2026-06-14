import { AccessLogRepository } from '../repositories/accessLogRepository';
import { UrlRepository } from '../repositories/urlRepository';
import { StatsResponse } from '../types';
import { AppError } from '../middlewares/errorHandler';

export class StatsService {
  constructor(
    private readonly urlRepository: UrlRepository,
    private readonly accessLogRepository: AccessLogRepository
  ) {}

  async getStats(code: string): Promise<StatsResponse> {
    const url = await this.urlRepository.findByCode(code);
    if (!url) throw new AppError('URL not found', 404);

    const [totalClicks, lastLog] = await Promise.all([
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
