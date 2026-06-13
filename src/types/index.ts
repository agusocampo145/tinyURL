export interface CreateUrlDto {
  originalUrl: string;
  alias?: string;
}

export interface AccessEvent {
  code: string;
  date: Date;
  ip: string;
  userAgent: string;
}

export interface StatsResponse {
  code: string;
  totalClicks: number;
  lastClick: Date | null;
}
