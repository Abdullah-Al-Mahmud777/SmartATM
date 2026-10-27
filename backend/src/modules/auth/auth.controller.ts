import { Request, Response } from 'express';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { authCookieNames } from '../../config/env';
import { Account, IAccount } from '../../models/account.model';
import {
  LoginHistory,
  RefreshToken,
  SecurityQuestion,
} from '../../models/auth.models';
import { Notification } from '../../models/notification.model';
import { IUser, User } from '../../models/user.model';
import {
  DEFAULT_BRANCH,
  generateAccountNumber,
  generateCustomerRef,
} from '../../utils/accountDefaults';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { writeAudit, writeLoginHistory } from '../../utils/audit';
import { clearAuthCookies, setAuthCookies, setCsrfCookie } from '../../utils/cookies';
import { getRequestMeta } from '../../utils/requestMeta';
import { sendSuccess } from '../../utils/response';
import { serializeAccount, serializeUser } from '../../utils/serializers';
import {
  generateCsrfToken,
  hashPassword,
  hashPin,
  hashRefreshToken,
  hashSecurityAnswer,
  verifyAccessToken,
  verifyDummyPassword,
  verifyPassword,
  verifyRefreshToken,
  verifySecurityAnswer,
} from '../../utils/security';
import { createSession } from '../../utils/session';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

type UserDocument = HydratedDocument<IUser>;

function parseDateOnly(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

async function loadAccounts(userId: Types.ObjectId | string) {
  return Account.find({ userId })
    .sort({ isPrimary: -1, createdAt: 1 })
    .exec();
}

function sessionUser(user: UserDocument) {
  return {
    id: user._id.toString(),
    userId: user.userId,
    tokenVersion: user.tokenVersion,
  };
}

export const getCsrfToken = asyncHandler(async (_req: Request, res: Response) => {
  const csrfToken = generateCsrfToken();
  setCsrfCookie(res, csrfToken);
  sendSuccess(res, { csrfToken }, 'Security token issued');
});

export const getSecurityQuestions = asyncHandler(async (_req: Request, res: Response) => {
  const questions = await SecurityQuestion.find({ isActive: true })
    .sort({ question: 1 })
    .lean()
    .exec();

  sendSuccess(
    res,
    questions.map((question) => ({
      id: question._id.toString(),
      question: question.question,
    })),
    'Security questions loaded'
  );
});

export const getSessionStatus = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies?.[authCookieNames.access];
  if (typeof accessToken === 'string' && accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      const user = await User.findById(payload.sub).select('status tokenVersion');
      if (user && user.status === 'active' && user.tokenVersion === payload.tv) {
        sendSuccess(res, { authenticated: true }, 'Session is active');
        return;
      }
    } catch {
      // Fall through to the refresh-token check.
    }
  }

  const refreshToken = req.cookies?.[authCookieNames.refresh];
  if (typeof refreshToken === 'string' && refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const [user, stored] = await Promise.all([
        User.findById(payload.sub).select('status tokenVersion'),
        RefreshToken.exists({
          tokenHash: hashRefreshToken(refreshToken),
          revokedAt: null,
          expiresAt: { $gt: new Date() },
        }),
      ]);
      if (stored && user && user.status === 'active' && user.tokenVersion === payload.tv) {
        sendSuccess(res, { authenticated: true }, 'Session is active');
        return;
      }
    } catch {
      // Treat an invalid refresh token as an unauthenticated session.
    }
  }

  sendSuccess(res, { authenticated: false }, 'No active session');
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    dateOfBirth: string;
    userId: string;
    email: string;
    fullName: string;
    mobile: string;
    password: string;
    transactionPin: string;
    securityQuestionId: string;
    securityAnswer: string;
  };
  const meta = getRequestMeta(req);
  const dateOfBirth = parseDateOnly(body.dateOfBirth);
  const userId = body.userId.trim().toLowerCase();
  const email = body.email.trim().toLowerCase();
  const mobile = body.mobile.trim().replace(/[\s-]/g, '');

  const [passwordHash, pinHash, answerHash] = await Promise.all([
    hashPassword(body.password),
    hashPin(body.transactionPin),
    hashSecurityAnswer(body.securityAnswer),
  ]);

  const mongoSession = await mongoose.startSession();
  let result:
    | {
        user: UserDocument;
        account: HydratedDocument<IAccount>;
      }
    | undefined;

  try {
    await mongoSession.withTransaction(async () => {
      const question = await SecurityQuestion.findOne({
        _id: body.securityQuestionId,
        isActive: true,
      }).session(mongoSession);

      if (!question) {
        throw ApiError.badRequest('Choose a valid security question.');
      }

      const duplicate = await User.findOne({
        $or: [{ userId }, { email }, { mobile }],
      })
        .session(mongoSession)
        .select('userId email mobile');

      if (duplicate) {
        if (duplicate.userId === userId) {
          throw ApiError.conflict('That User ID is already taken.');
        }
        if (duplicate.email === email) {
          throw ApiError.conflict('That email address is already registered.');
        }
        throw ApiError.conflict('That mobile number is already registered.');
      }

      const [user] = await User.create(
        [
          {
            userId,
            email,
            passwordHash,
            transactionPinHash: pinHash,
            fullName: body.fullName.trim(),
            mobile,
            dateOfBirth,
            securityQuestionId: question._id,
            securityAnswerHash: answerHash,
            passwordChangedAt: new Date(),
          },
        ],
        { session: mongoSession }
      );

      const accountNumber = generateAccountNumber(user._id);
      const [account] = await Account.create(
        [
          {
            accountNumber,
            userId: user._id,
            customerRef: generateCustomerRef(user._id),
            holderName: user.fullName,
            accountType: 'savings',
            branchCode: DEFAULT_BRANCH.code,
            branchName: DEFAULT_BRANCH.name,
            balancePaisa: 0,
            availableBalancePaisa: 0,
            currency: 'BDT',
            status: 'active',
            isPrimary: true,
            dateOfBirth,
            openedAt: new Date(),
          },
        ],
        { session: mongoSession }
      );

      await Notification.create(
        [
          {
            userId: user._id,
            type: 'welcome',
            title: 'Welcome to SmartBank',
            message: `Hi ${user.fullName}, your SmartBank savings account ${account.accountNumber} is ready with an opening balance of BDT 0.00. Sign in to view your account.`,
            severity: 'success',
          },
        ],
        { session: mongoSession }
      );

      await writeAudit(
        {
          userId: user._id,
          action: 'user_registered',
          entityType: 'user',
          entityId: user._id.toString(),
          meta,
          metadata: {
            accountNumber: account.accountNumber,
            customerRef: account.customerRef,
          },
        },
        mongoSession
      );

      result = { user, account };
    });
  } finally {
    await mongoSession.endSession();
  }

  if (!result) {
    throw new ApiError(500, 'Registration could not be completed. Please try again.');
  }

  sendSuccess(
    res,
    {
      user: serializeUser(result.user),
      accounts: [serializeAccount(result.account)],
    },
    'Your SmartBank account has been created. Please sign in.',
    201
  );
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body as { identifier: string; password: string };
  const meta = getRequestMeta(req);
  const normalized = identifier.toLowerCase();

  const user = await User.findOne({
    $or: [{ userId: normalized }, { email: normalized }],
  }).select('+passwordHash');

  if (!user) {
    await verifyDummyPassword(password);
    await writeLoginHistory({ status: 'failed', meta, failureReason: 'Unknown identifier' });
    await writeAudit({
      action: 'user_login_failed',
      meta,
      metadata: { identifier },
    });
    throw ApiError.unauthorized('Invalid User ID/email or password.');
  }

  if (user.status !== 'active') {
    throw ApiError.forbidden('This account is not active. Please contact support.');
  }

  const now = new Date();
  const lockRemainingMs =
    user.lockedUntil && user.lockedUntil.getTime() > now.getTime()
      ? user.lockedUntil.getTime() - now.getTime()
      : 0;

  if (lockRemainingMs > 0) {
    throw ApiError.locked(
      'Too many failed sign-in attempts. Your account is temporarily locked.',
      { retryAfterSeconds: Math.max(1, Math.ceil(lockRemainingMs / 1000)) }
    );
  }

  const attemptsBefore = user.lockedUntil ? 0 : user.failedLoginAttempts;
  const passwordMatches = await verifyPassword(password, user.passwordHash);

  if (!passwordMatches) {
    const nextAttempts = attemptsBefore + 1;
    const locked = nextAttempts >= MAX_FAILED_ATTEMPTS;
    const lockedUntil = locked
      ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
      : null;

    const mongoSession = await mongoose.startSession();
    try {
      await mongoSession.withTransaction(async () => {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              failedLoginAttempts: locked ? MAX_FAILED_ATTEMPTS : nextAttempts,
              lockedUntil,
            },
          },
          { session: mongoSession }
        );
        await writeLoginHistory(
          {
            userId: user._id,
            status: 'failed',
            meta,
            failureReason: 'Incorrect password',
          },
          mongoSession
        );
        await writeAudit(
          {
            userId: user._id,
            action: 'user_login_failed',
            entityType: 'user',
            entityId: user._id.toString(),
            meta,
          },
          mongoSession
        );
      });
    } finally {
      await mongoSession.endSession();
    }

    if (locked) {
      throw ApiError.locked(
        `Too many failed sign-in attempts. Your account is locked for ${LOCK_MINUTES} minutes.`,
        { retryAfterSeconds: LOCK_MINUTES * 60 }
      );
    }

    throw ApiError.unauthorized('Invalid User ID/email or password.');
  }

  const hadSuccessfulLogin = Boolean(
    await LoginHistory.exists({ userId: user._id, status: 'success' })
  );
  const sameDevice = Boolean(
    await LoginHistory.exists({
      userId: user._id,
      status: 'success',
      device: meta.device,
      browser: meta.browser,
      location: meta.location,
    })
  );
  const newDevice = hadSuccessfulLogin && !sameDevice;

  let tokens;
  const mongoSession = await mongoose.startSession();
  try {
    tokens = await mongoSession.withTransaction(async () => {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastLoginAt: now,
          },
        },
        { session: mongoSession }
      );

      await writeLoginHistory({ userId: user._id, status: 'success', meta }, mongoSession);
      await writeAudit(
        {
          userId: user._id,
          action: 'user_login',
          entityType: 'user',
          entityId: user._id.toString(),
          meta,
        },
        mongoSession
      );

      if (newDevice && user.notificationPreferences?.loginAlerts !== false) {
        await Notification.create(
          [
            {
              userId: user._id,
              type: 'login',
              title: 'New sign-in detected',
              message: `${meta.device} sign-in from IP ${meta.ip} (${meta.location}). If this was not you, change your password immediately.`,
              severity: 'warning',
            },
          ],
          { session: mongoSession }
        );
      }

      return createSession(sessionUser(user), req, mongoSession);
    });
  } finally {
    await mongoSession.endSession();
  }

  if (!tokens) {
    throw new ApiError(500, 'Sign-in could not be completed. Please try again.');
  }

  user.lastLoginAt = now;
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;

  setAuthCookies(res, tokens);
  const accounts = await loadAccounts(user._id);

  sendSuccess(
    res,
    {
      user: serializeUser(user),
      accounts: accounts.map(serializeAccount),
      csrfToken: tokens.csrfToken,
    },
    'Signed in successfully'
  );
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.bank_refresh;
  if (typeof token !== 'string' || !token) {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }

  const payload = verifyRefreshToken(token);
  const tokenHash = hashRefreshToken(token);

  const stored = await RefreshToken.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!stored) {
    await RefreshToken.deleteMany({ userId: payload.sub });
    clearAuthCookies(res);
    throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
  }

  const user = await User.findById(payload.sub);
  if (!user || user.status !== 'active' || user.tokenVersion !== payload.tv) {
    clearAuthCookies(res);
    throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
  }

  const mongoSession = await mongoose.startSession();
  let tokens;
  try {
    tokens = await mongoSession.withTransaction(async () => {
      const consumed = await RefreshToken.findOneAndUpdate(
        { _id: stored._id, revokedAt: null },
        { $set: { revokedAt: new Date() } },
        { session: mongoSession, new: false }
      );

      if (!consumed) {
        throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
      }

      return createSession(sessionUser(user), req, mongoSession);
    });
  } finally {
    await mongoSession.endSession();
  }

  if (!tokens) {
    throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
  }

  setAuthCookies(res, tokens);
  sendSuccess(res, { csrfToken: tokens.csrfToken }, 'Session refreshed');
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.bank_refresh;
  const meta = getRequestMeta(req);

  if (typeof token === 'string' && token) {
    try {
      const payload = verifyRefreshToken(token);
      await RefreshToken.updateOne(
        { tokenHash: hashRefreshToken(token), revokedAt: null },
        { $set: { revokedAt: new Date() } }
      );
      await writeAudit({
        userId: payload.sub,
        action: 'user_logout',
        entityType: 'user',
        entityId: payload.sub,
        meta,
      });
    } catch {
      // An expired refresh token should not prevent logout.
    }
  }

  clearAuthCookies(res);
  sendSuccess(res, null, 'Signed out successfully');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) throw ApiError.unauthorized('Account not found.');

  const accounts = await loadAccounts(user._id);
  sendSuccess(res, {
    user: serializeUser(user),
    accounts: accounts.map(serializeAccount),
  });
});

export const getRecoveryQuestion = asyncHandler(async (req: Request, res: Response) => {
  const { accountNumber, dateOfBirth } = req.query as unknown as {
    accountNumber: string;
    dateOfBirth: string;
  };

  const account = await Account.findOne({
    accountNumber,
    dateOfBirth: parseDateOnly(dateOfBirth),
    userId: { $ne: null },
    status: 'active',
  })
    .populate<{ userId: UserDocument }>('userId')
    .exec();

  if (!account?.userId) {
    throw ApiError.notFound('No active online banking account was found with those details.');
  }

  const question = await SecurityQuestion.findById(account.userId.securityQuestionId);
  if (!question) {
    throw ApiError.notFound('A recovery question is not configured for this account.');
  }

  sendSuccess(res, {
    questionId: question._id.toString(),
    question: question.question,
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const body = req.body as {
    accountNumber: string;
    dateOfBirth: string;
    securityAnswer: string;
    newPassword: string;
  };
  const meta = getRequestMeta(req);

  const account = await Account.findOne({
    accountNumber: body.accountNumber,
    dateOfBirth: parseDateOnly(body.dateOfBirth),
    userId: { $ne: null },
    status: 'active',
  });

  if (!account?.userId) {
    throw ApiError.notFound('No active online banking account was found with those details.');
  }

  const user = await User.findById(account.userId).select(
    '+passwordHash +securityAnswerHash'
  );
  if (!user || user.status !== 'active') {
    throw ApiError.notFound('No active online banking account was found with those details.');
  }

  const answerMatches = await verifySecurityAnswer(
    body.securityAnswer,
    user.securityAnswerHash
  );
  if (!answerMatches) {
    throw ApiError.badRequest('The security answer is incorrect.');
  }

  const samePassword = await verifyPassword(body.newPassword, user.passwordHash);
  if (samePassword) {
    throw ApiError.badRequest('Your new password must be different from the current password.');
  }

  const passwordHash = await hashPassword(body.newPassword);

  const mongoSession = await mongoose.startSession();
  try {
    await mongoSession.withTransaction(async () => {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            passwordHash,
            failedLoginAttempts: 0,
            lockedUntil: null,
            passwordChangedAt: new Date(),
          },
          $inc: { tokenVersion: 1 },
        },
        { session: mongoSession }
      );

      await RefreshToken.deleteMany({ userId: user._id }, { session: mongoSession });

      await Notification.create(
        [
          {
            userId: user._id,
            type: 'security',
            title: 'Password changed',
            message:
              'Your password was reset using your security question. All other sessions were signed out.',
            severity: 'warning',
          },
        ],
        { session: mongoSession }
      );

      await writeAudit(
        {
          userId: user._id,
          action: 'password_reset',
          entityType: 'user',
          entityId: user._id.toString(),
          meta,
        },
        mongoSession
      );
    });
  } finally {
    await mongoSession.endSession();
  }

  sendSuccess(res, null, 'Password reset successfully. You can now sign in.');
});
