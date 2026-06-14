import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export function validateCreateUrl(
    req: Request,
    res: Response,
    next: NextFunction
): void {
    const { originalUrl, alias } = req.body;

    if (!originalUrl) {
        return next(new AppError('originalUrl is required', 400));
    }

    try {
        new URL(originalUrl);
    } catch {
        return next(new AppError('originalUrl must be a valid URL', 400));
    }

    if (alias !== undefined) {
        if (typeof alias !== 'string') {
            return next(new AppError('alias must be a string', 400));
        }
        if (alias.trim().length === 0) {
            return next(new AppError('alias cannot be empty', 400));
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(alias)) {
            return next(new AppError('alias can only contain letters, numbers, hyphens and underscores', 400));
        }
        if (alias.length > 50) {
            return next(new AppError('alias cannot exceed 50 characters', 400));
        }
    }

    next();
}
