import { IUrl, Url } from "../models/url";

export class UrlRepository {
  async findByCode(code: string): Promise<IUrl | null> {
    return Url.findOne({ code });
  }

  async existsByCode(code: string): Promise<boolean> {
    const doc = await Url.exists({ code });
    return doc !== null;
  }

  async create(originalUrl: string, code: string): Promise<IUrl> {
    const url = new Url({ originalUrl, code });
    return url.save();
  }
}
