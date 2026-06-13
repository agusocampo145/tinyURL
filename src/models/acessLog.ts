import { Schema, model, Document } from 'mongoose';

export interface IAccessLog extends Document {
  code: string;
  accessedAt: Date;
  ip: string;
  userAgent: string;
}

const AccessLogSchema = new Schema<IAccessLog>({
  code: { type: String, required: true, index: true },
  accessedAt: { type: Date, default: Date.now },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
});

export const AccessLog = model<IAccessLog>('AccessLog', AccessLogSchema);
