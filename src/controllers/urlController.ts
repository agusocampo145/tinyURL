import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/stateService';
import { UrlService } from '../services/urlService';


//Helper
const toString = (value: string | string[] | undefined): string => {
    if (Array.isArray(value)) return value[0] ?? 'unknown';
    return value ?? 'unknown';
};

export class UrlController {
    constructor(
        private readonly urlService: UrlService,
        private readonly statsService: StatsService
    ) { }

    async create(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const shortUrl = await this.urlService.createShortUrl(req.body);
            res.status(201).json({ shortUrl });
        } catch (error) {
            next(error);
        }
    }

    async redirect(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const code = toString(req.params.code);
            const ip = toString(req.ip);
            const userAgent = toString(req.headers['user-agent']);

            const originalUrl = await this.urlService.resolveUrl(code, ip, userAgent);
            res.redirect(302, originalUrl);
        } catch (error) {
            next(error);
        }
    }



    async stats(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const code = String(req.params.code);
            const result = await this.statsService.getStats(code);
            res.status(200).json(result);
        } catch (error) {
            next(error);
        }
    }

}
