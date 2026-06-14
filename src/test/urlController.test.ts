import { UrlController } from '../controllers/urlController';
import { Request, Response, NextFunction } from 'express';

const mockUrlService = {
  createShortUrl: jest.fn(),
  resolveUrl: jest.fn(),
};

const mockStatsService = {
  getStats: jest.fn(),
};

const mockReq = (overrides = {}): Partial<Request> => ({
  body: {},
  params: {},
  headers: {},
  ip: '127.0.0.1',
  ...overrides,
});

const mockRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.redirect = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: NextFunction = jest.fn();

describe('UrlController', () => {
  let controller: UrlController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UrlController(mockUrlService as any, mockStatsService as any);
  });

  // ─── create ───────────────────────────────────────────────────

  describe('create', () => {
    it('debería responder 201 con la shortUrl', async () => {
      const req = mockReq({ body: { originalUrl: 'https://google.com' } });
      const res = mockRes();
      mockUrlService.createShortUrl.mockResolvedValue('http://localhost:3000/abc123');

      await controller.create(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ shortUrl: 'http://localhost:3000/abc123' });
    });

    it('debería llamar next con el error si falla', async () => {
      const req = mockReq({ body: { originalUrl: 'https://google.com' } });
      const res = mockRes();
      const error = new Error('Alias already in use');
      mockUrlService.createShortUrl.mockRejectedValue(error);

      await controller.create(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─── redirect ─────────────────────────────────────────────────

  describe('redirect', () => {
    it('debería redirigir 302 a la URL original', async () => {
      const req = mockReq({
        params: { code: 'abc123' },
        headers: { 'user-agent': 'Mozilla' },
      });
      const res = mockRes();
      mockUrlService.resolveUrl.mockResolvedValue('https://google.com');

      await controller.redirect(req as Request, res as Response, mockNext);

      expect(res.redirect).toHaveBeenCalledWith(302, 'https://google.com');
    });

    it('debería llamar next si el code no existe', async () => {
      const req = mockReq({ params: { code: 'noexiste' }, headers: {} });
      const res = mockRes();
      const error = new Error('URL not found');
      mockUrlService.resolveUrl.mockRejectedValue(error);

      await controller.redirect(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ─── stats ────────────────────────────────────────────────────

  describe('stats', () => {
    it('debería responder 200 con las stats', async () => {
      const req = mockReq({ params: { code: 'abc123' } });
      const res = mockRes();
      const stats = { code: 'abc123', totalClicks: 5, lastClick: null };
      mockStatsService.getStats.mockResolvedValue(stats);

      await controller.stats(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(stats);
    });

    it('debería llamar next si el code no existe', async () => {
      const req = mockReq({ params: { code: 'noexiste' } });
      const res = mockRes();
      const error = new Error('URL not found');
      mockStatsService.getStats.mockRejectedValue(error);

      await controller.stats(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
