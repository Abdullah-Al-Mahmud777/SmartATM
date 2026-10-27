import { Request, Response } from 'express';
import { Admin } from '../../models/admin.model';
import { Account } from '../../models/account.model';
import { Transaction } from '../../models/transaction.model';
import { User } from '../../models/user.model';
import { Settings, getSettings } from '../../models/settings.model';
import { authCookieNames } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { writeAudit } from '../../utils/audit';
import {
  clearAdminAccessCookie,
  clearAdminRefreshCookie,
  setAdminAccessCookie,
  setAdminRefreshCookie,
} from '../../utils/cookies';
import {
  hashPassword,
  signAdminAccessToken,
  signAdminRefreshToken,
  verifyAdminRefreshToken,
  verifyPassword,
} from '../../utils/security';
import { getRequestMeta } from '../../utils/requestMeta';
import { sendSuccess } from '../../utils/response';
import { requireAdmin } from '../../middleware/adminAuth';
import {
  adminLoginSchema,
  adminSettingsSchema,
  changePasswordSchema,
} from './admin.schemas';

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function movementFor(
  rows: Array<{ _id: string; count: number; volumePaisa: number }>,
  type: string
) {
  const row = rows.find((entry) => entry._id === type);
  return {
    count: row?.count ?? 0,
    volumePaisa: row?.volumePaisa ?? 0,
  };
}

export const getAdminMe = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.admin;
  if (!admin) {
    throw ApiError.unauthorized('Please sign in as an admin to continue.');
  }
  const fresh = await Admin.findById(admin.id).select(
    'email name level status tokenVersion passwordChangeRequired'
  );
  if (!fresh || fresh.status !== 'active') {
    throw ApiError.forbidden('This admin account is not available.');
  }
  sendSuccess(
    res,
    {
      admin: {
        id: fresh._id.toString(),
        email: fresh.email,
        name: fresh.name,
        level: fresh.level,
        status: fresh.status,
        passwordChangeRequired: fresh.passwordChangeRequired === true,
      },
    },
    'Admin session is active'
  );
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const body = adminLoginSchema.parse(req.body);
  const meta = getRequestMeta(req);
  const email = body.email.trim().toLowerCase();

  const admin = await Admin.findOne({ email })
    .select(
      'passwordHash level status failedLoginAttempts lockedUntil tokenVersion passwordChangeRequired'
    )
    .exec();

  if (!admin) {
    await writeAudit({
      adminId: null,
      action: 'admin_login_failed',
      entityType: 'admin',
      entityId: email,
      meta,
      metadata: { reason: 'unknown_admin' },
    });
    throw ApiError.unauthorized('Invalid admin credentials.');
  }

  const now = new Date();
  if (admin.status !== 'active') {
    throw ApiError.forbidden('This admin account is not available.');
  }
  if (admin.lockedUntil && admin.lockedUntil > now) {
    throw ApiError.locked('Admin login is locked. Please try again later.');
  }

  const passwordMatches = await verifyPassword(body.password, admin.passwordHash);
  if (!passwordMatches) {
    const failedLoginAttempts = admin.failedLoginAttempts + 1;
    const lockedUntil =
      failedLoginAttempts >= MAX_FAILED_ATTEMPTS
        ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
        : admin.lockedUntil;
    await Admin.findByIdAndUpdate(
      admin._id,
      { $set: { failedLoginAttempts, lockedUntil } },
      { new: true }
    );
    await writeAudit({
      adminId: admin._id,
      action: 'admin_login_failed',
      entityType: 'admin',
      entityId: admin._id.toString(),
      meta,
      metadata: { reason: 'invalid_password', attempts: failedLoginAttempts },
    });
    if (failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      throw ApiError.locked('Admin login is locked. Please try again later.');
    }
    throw ApiError.unauthorized('Invalid admin credentials.');
  }

  const settings = await getSettings();
  const accessTokenTtlSeconds = Math.max(60, settings.userAutoLogoutMinutes * 60);
  const accessToken = signAdminAccessToken(
    { id: admin._id.toString(), level: admin.level, tokenVersion: admin.tokenVersion },
    accessTokenTtlSeconds
  );
  setAdminAccessCookie(res, accessToken, accessTokenTtlSeconds);

  const refreshToken = signAdminRefreshToken(
    { id: admin._id.toString(), level: admin.level, tokenVersion: admin.tokenVersion },
    accessTokenTtlSeconds
  );
  setAdminRefreshCookie(res, refreshToken, accessTokenTtlSeconds);

  await Admin.findByIdAndUpdate(
    admin._id,
    { $set: { failedLoginAttempts: 0, lockedUntil: null } },
    { new: true }
  );
  await writeAudit({
    adminId: admin._id,
    action: 'admin_login',
    entityType: 'admin',
    entityId: admin._id.toString(),
    meta,
    after: { level: admin.level, status: admin.status },
  });

  sendSuccess(
    res,
    {
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        level: admin.level,
      },
      expiresInSeconds: accessTokenTtlSeconds,
      mustChangePassword: admin.passwordChangeRequired === true,
    },
    'Admin signed in successfully'
  );
});

export const adminLogout = asyncHandler(async (req: Request, res: Response) => {
  clearAdminAccessCookie(res);
  clearAdminRefreshCookie(res);
  const admin = req.admin;
  if (admin) {
    await Admin.findByIdAndUpdate(
      admin.id,
      { $set: { tokenVersion: (admin.tokenVersion ?? 0) + 1 } },
      { new: true }
    );
  }
  sendSuccess(res, { revoked: true }, 'Admin signed out successfully');
});

export const adminRefresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[authCookieNames.refresh];
  if (!refreshToken) {
    throw ApiError.unauthorized('No admin refresh token found.');
  }
  const payload = verifyAdminRefreshToken(refreshToken);
  const admin = await Admin.findById(payload.sub)
    .select('email name level status tokenVersion passwordChangeRequired')
    .exec();
  if (!admin || admin.status !== 'active') {
    throw ApiError.forbidden('This admin account is not available.');
  }
  if (admin.tokenVersion !== payload.tv) {
    throw ApiError.unauthorized('Your admin session is no longer valid.');
  }
  const settings = await getSettings();
  const accessTokenTtlSeconds = Math.max(60, settings.userAutoLogoutMinutes * 60);
  const accessToken = signAdminAccessToken(
    { id: admin._id.toString(), level: admin.level, tokenVersion: admin.tokenVersion },
    accessTokenTtlSeconds
  );
  setAdminAccessCookie(res, accessToken, accessTokenTtlSeconds);
  sendSuccess(
    res,
    {
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        level: admin.level,
      },
      expiresInSeconds: accessTokenTtlSeconds,
      mustChangePassword: admin.passwordChangeRequired === true,
    },
    'Admin session refreshed'
  );
});

export const adminChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.admin;
  if (!admin) {
    throw ApiError.unauthorized('Please sign in as an admin to continue.');
  }
  const body = changePasswordSchema.parse(req.body);
  const currentAdmin = await Admin.findById(admin.id)
    .select('passwordHash passwordChangeRequired level status tokenVersion')
    .exec();
  if (!currentAdmin) {
    throw ApiError.notFound('Admin not found.');
  }
  if (currentAdmin.status !== 'active') {
    throw ApiError.forbidden('This admin account is not available.');
  }
  const passwordMatches = await verifyPassword(body.currentPassword, currentAdmin.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Current password is incorrect.');
  }
  const updated = await Admin.findByIdAndUpdate(
    admin.id,
    { $set: { passwordHash: await hashPassword(body.newPassword), passwordChangeRequired: false } },
    { new: true }
  ).exec();
  if (!updated) {
    throw ApiError.notFound('Admin not found.');
  }
  await Admin.findByIdAndUpdate(
    admin.id,
    { $set: { tokenVersion: (currentAdmin.tokenVersion ?? 0) + 1 } },
    { new: true }
  );
  await writeAudit({
    adminId: admin.id,
    action: 'admin_password_change',
    entityType: 'admin',
    entityId: admin.id,
    meta: getRequestMeta(req),
    before: { passwordChangeRequired: currentAdmin.passwordChangeRequired },
    after: { passwordChangeRequired: false },
  });
  sendSuccess(res, { ok: true }, 'Password updated');
});

export const getAdminOverview = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const startOfToday = startOfDay(now);
  const startOfWeek = new Date(startOfToday.getTime() - 6 * DAY_MS);

  const [
    totalUsers,
    totalAccounts,
    balanceRows,
    todayRows,
    pendingWithdrawalRows,
    newRegistrationsToday,
    newRegistrationsWeek,
    lockedAndBlocked,
  ] = await Promise.all([
    User.countDocuments({}),
    Account.countDocuments({}),
    Account.aggregate<{ _id?: null; totalBalancePaisa: number }>([
      { $group: { _id: null, totalBalancePaisa: { $sum: '$balancePaisa' } } },
    ]),
    Transaction.aggregate<{ _id: string; count: number; volumePaisa: number }>([
      { $match: { createdAt: { $gte: startOfToday } } },
      {
        $group: { _id: '$type', count: { $sum: 1 }, volumePaisa: { $sum: '$amountPaisa' } },
      },
    ]),
    Transaction.aggregate<{ _id?: null; count: number; volumePaisa: number }>([
      { $match: { type: 'withdrawal', status: 'pending', createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, count: { $sum: 1 }, volumePaisa: { $sum: '$amountPaisa' } } },
    ]),
    User.countDocuments({ createdAt: { $gte: startOfToday } }),
    User.countDocuments({ createdAt: { $gte: startOfWeek } }),
    User.countDocuments({
      $or: [{ status: 'suspended' }, { lockedUntil: { $gt: new Date() } }],
    }),
  ]);

  const pendingWithdrawal = pendingWithdrawalRows[0];
  const alerts = [
    {
      code: 'PENDING_WITHDRAWALS',
      severity: 'warning',
      title: 'Pending withdrawals',
      description: 'Withdrawals waiting for the automatic completion window.',
      count: pendingWithdrawal?.count ?? 0,
      amountPaisa: pendingWithdrawal?.volumePaisa ?? 0,
    },
  ];

  const chartRows = await Transaction.aggregate<{
    _id: string;
    count: number;
    volumePaisa: number;
  }>([
    {
      $match: { createdAt: { $gte: startOfWeek, $lt: new Date(startOfToday.getTime() + 7 * DAY_MS) } },
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        volumePaisa: { $sum: '$amountPaisa' },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  sendSuccess(
    res,
    {
      totals: {
        users: totalUsers,
        accounts: totalAccounts,
        balancePaisa: balanceRows[0]?.totalBalancePaisa ?? 0,
      },
      today: {
        deposit: movementFor(todayRows, 'deposit'),
        withdrawal: movementFor(todayRows, 'withdrawal'),
        transfer: movementFor(todayRows, 'transfer_debit'),
        exchange: movementFor(todayRows, 'exchange'),
      },
      pendingWithdrawals: {
        count: pendingWithdrawal?.count ?? 0,
        volumePaisa: pendingWithdrawal?.volumePaisa ?? 0,
      },
      newRegistrations: {
        today: newRegistrationsToday,
        last7Days: newRegistrationsWeek,
      },
      lockedAndBlocked: { count: lockedAndBlocked },
      chart: chartRows.map((row) => ({
        date: row._id,
        count: row.count,
        volumePaisa: row.volumePaisa,
      })),
      alerts,
    },
    'Admin overview loaded'
  );
});

export const getAdminSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await getSettings();
  sendSuccess(res, settings, 'Settings loaded');
});

export const updateAdminSettings = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.admin;
  if (!admin) {
    throw ApiError.unauthorized('Please sign in as an admin to continue.');
  }
  const body = adminSettingsSchema.parse(req.body);
  const before = await getSettings();
  const updated = await Settings.findOneAndUpdate({ key: 'app' }, { $set: body }, { new: true }).exec();
  if (!updated) {
    throw ApiError.notFound('Settings not found.');
  }
  await writeAudit({
    adminId: admin.id,
    action: 'settings_update',
    entityType: 'settings',
    entityId: updated._id.toString(),
    meta: getRequestMeta(req),
    before: before ? ({ ...before } as Record<string, unknown>) : null,
    after: updated ? ({ ...updated } as Record<string, unknown>) : null,
  });
  sendSuccess(res, updated, 'Settings updated');
});
