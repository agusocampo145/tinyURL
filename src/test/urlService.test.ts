import { UrlService } from '../services/urlService';
import { redis } from '../config/redis';
import { accessQueue } from '../queues/accessQueue';
import { generateCode } from '../utils/generateCode';

// Mocks
jest.mock('../config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('../queues/accessQueue', () => ({
  accessQueue: {
    add: jest.fn(),
  },
}));

jest.mock('../utils/generateCode', () => ({
  generateCode: jest.fn(),
}));

const mockUrlRepository = {
  create: jest.fn(),
  existsByCode: jest.fn(),
  findByCode: jest.fn(),
};

describe('UrlService', () => {
  let service: UrlService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BASE_URL = 'http://localhost:3000';
    service = new UrlService(mockUrlRepository as any);
  });

  // ─── createShortUrl ───────────────────────────────────────────

  describe('createShortUrl', () => {
    it('debería crear una URL corta con code generado', async () => {
      (generateCode as jest.Mock).mockReturnValue('abc123');
      mockUrlRepository.existsByCode.mockResolvedValue(false);
      mockUrlRepository.create.mockResolvedValue(undefined);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await service.createShortUrl({ originalUrl: 'https://google.com' });

      expect(result).toBe('http://localhost:3000/abc123');
      expect(mockUrlRepository.create).toHaveBeenCalledWith('https://google.com', 'abc123');
      expect(redis.set).toHaveBeenCalledWith('abc123', 'https://google.com', 'EX', 3600);
    });

    it('debería usar el alias si se provee', async () => {
      mockUrlRepository.existsByCode.mockResolvedValue(false);
      mockUrlRepository.create.mockResolvedValue(undefined);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await service.createShortUrl({
        originalUrl: 'https://google.com',
        alias: 'google',
      });

      expect(result).toBe('http://localhost:3000/google');
      expect(mockUrlRepository.create).toHaveBeenCalledWith('https://google.com', 'google');
    });

    it('debería lanzar error si el alias ya está en uso', async () => {
      mockUrlRepository.existsByCode.mockResolvedValue(true);

      await expect(
        service.createShortUrl({ originalUrl: 'https://google.com', alias: 'google' })
      ).rejects.toThrow('Alias already in use');

      expect(mockUrlRepository.create).not.toHaveBeenCalled();
    });

    it('debería reintentar si el code generado ya existe', async () => {
      (generateCode as jest.Mock)
        .mockReturnValueOnce('duplicado')
        .mockReturnValueOnce('unico');

      mockUrlRepository.existsByCode
        .mockResolvedValueOnce(true)  // 'duplicado' existe
        .mockResolvedValueOnce(false); // 'unico' no existe

      mockUrlRepository.create.mockResolvedValue(undefined);
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await service.createShortUrl({ originalUrl: 'https://google.com' });

      expect(result).toBe('http://localhost:3000/unico');
      expect(generateCode).toHaveBeenCalledTimes(2);
    });
  });

  // ─── resolveUrl ───────────────────────────────────────────────

  describe('resolveUrl', () => {
    it('debería retornar URL desde cache', async () => {
      (redis.get as jest.Mock).mockResolvedValue('https://google.com');

      const result = await service.resolveUrl('abc123', '127.0.0.1', 'Mozilla');

      expect(result).toBe('https://google.com');
      expect(mockUrlRepository.findByCode).not.toHaveBeenCalled();
      expect(accessQueue.add).toHaveBeenCalledWith('access', expect.objectContaining({
        code: 'abc123',
        ip: '127.0.0.1',
        userAgent: 'Mozilla',
      }));
    });

    it('debería retornar URL desde DB si no está en cache', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      mockUrlRepository.findByCode.mockResolvedValue({ originalUrl: 'https://google.com' });
      (redis.set as jest.Mock).mockResolvedValue('OK');

      const result = await service.resolveUrl('abc123', '127.0.0.1', 'Mozilla');

      expect(result).toBe('https://google.com');
      expect(mockUrlRepository.findByCode).toHaveBeenCalledWith('abc123');
      expect(redis.set).toHaveBeenCalledWith('abc123', 'https://google.com', 'EX', 3600);
    });

    it('debería lanzar error si no existe en cache ni en DB', async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      mockUrlRepository.findByCode.mockResolvedValue(null);

      await expect(
        service.resolveUrl('noexiste', '127.0.0.1', 'Mozilla')
      ).rejects.toThrow('URL not found');
    });
  });
});
