import { IAccessLog, AccessLog } from "../models/accessLog";

export class AccessLogRepository {
  async create(data: {
    code: string;
    ip: string;
    userAgent: string;
  }): Promise<IAccessLog> {
    const log = new AccessLog(data);
    return log.save();
  }

  async countByCode(code: string): Promise<number> {
    return AccessLog.countDocuments({ code });
  }

  async findLastByCode(code: string): Promise<IAccessLog | null> {
    return AccessLog.findOne({ code }).sort({ accessedAt: -1 });
  }
}
