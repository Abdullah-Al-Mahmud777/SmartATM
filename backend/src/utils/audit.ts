import { ClientSession, Types } from 'mongoose';
import { AuditLog } from '../models/auth.models';
import { LoginHistory } from '../models/auth.models';
import { RequestMeta } from './requestMeta';

interface AuditInput {
  userId?: string | Types.ObjectId | null;
  adminId?: string | Types.ObjectId | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  meta: RequestMeta;
  metadata?: Record<string, unknown>;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export async function writeAudit(
  input: AuditInput,
  session?: ClientSession
): Promise<void> {
  const doc = {
    userId: input.userId ?? null,
    adminId: input.adminId ?? null,
    action: input.action,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    ipAddress: input.meta.ip,
    userAgent: input.meta.userAgent,
    metadata: input.metadata ?? {},
  };

  if (session) {
    await AuditLog.create([doc], { session });
  } else {
    await AuditLog.create(doc);
  }
}

interface LoginHistoryInput {
  userId?: string | Types.ObjectId | null;
  status: 'success' | 'failed';
  meta: RequestMeta;
  failureReason?: string | null;
}

export async function writeLoginHistory(
  input: LoginHistoryInput,
  session?: ClientSession
): Promise<void> {
  const doc = {
    userId: input.userId ?? null,
    device: input.meta.device,
    browser: input.meta.browser,
    ipAddress: input.meta.ip,
    location: input.meta.location,
    status: input.status,
    failureReason: input.failureReason ?? null,
  };

  if (session) {
    await LoginHistory.create([doc], { session });
  } else {
    await LoginHistory.create(doc);
  }
}
