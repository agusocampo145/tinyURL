import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number = 500
    ) {
        super(message);
        this.name = 'AppError';
    }
}

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
        return;
    }

    console.error('[Unhandled Error]', err);
    res.status(500).json({ error: 'Internal server error' });
}
