import { StatsService } from '../services/statsService';

const mockUrlRepository = {
  findByCode: jest.fn(),
};

const mockAccessLogRepository = {
  countByCode: jest.fn(),
  findLastByCode: jest.fn(),
};

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StatsService(mockUrlRepository as any, mockAccessLogRepository as any);
  });

  it('debería retornar stats correctamente', async () => {
    const lastDate = new Date();
    mockUrlRepository.findByCode.mockResolvedValue({ originalUrl: 'https://google.com' });
    mockAccessLogRepository.countByCode.mockResolvedValue(10);
    mockAccessLogRepository.findLastByCode.mockResolvedValue({ accessedAt: lastDate });

    const result = await service.getStats('abc123');

    expect(result).toEqual({
      code: 'abc123',
      totalClicks: 10,
      lastClick: lastDate,
    });
  });

  it('debería retornar lastClick null si no hay accesos', async () => {
    mockUrlRepository.findByCode.mockResolvedValue({ originalUrl: 'https://google.com' });
    mockAccessLogRepository.countByCode.mockResolvedValue(0);
    mockAccessLogRepository.findLastByCode.mockResolvedValue(null);

    const result = await service.getStats('abc123');

    expect(result.lastClick).toBeNull();
    expect(result.totalClicks).toBe(0);
  });

  it('debería lanzar error si el code no existe', async () => {
    mockUrlRepository.findByCode.mockResolvedValue(null);

    await expect(service.getStats('noexiste')).rejects.toThrow('URL not found');
  });
});
