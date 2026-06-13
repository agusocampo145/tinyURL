import { Schema, model, Document } from 'mongoose';

export interface IUrl extends Document {
  originalUrl: string;
  code: string;
  createdAt: Date;
}

const UrlSchema = new Schema<IUrl>(
  {
    originalUrl: { type: String, required: true },
    code: { type: String, required: true, unique: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Url = model<IUrl>('Url', UrlSchema);
