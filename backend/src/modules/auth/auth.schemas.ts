import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be 72 characters or fewer')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

const pin = z.string().regex(/^\d{4,6}$/, 'Transaction PIN must be 4 to 6 digits');

const accountNumber = z
  .string()
  .trim()
  .regex(/^\d{8,24}$/, 'Enter a valid account number');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Choose a valid security question');

const dateOfBirth = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) return false;
    if (date.toISOString().slice(0, 10) !== value) return false;
    const now = new Date();
    const age = (now.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    return age >= 16 && age <= 120;
  }, 'Enter a valid date of birth');

export const registerSchema = z
  .object({
    dateOfBirth,
    userId: z
      .string()
      .trim()
      .min(4, 'User ID must be at least 4 characters')
      .max(30, 'User ID must be 30 characters or fewer')
      .regex(/^[a-zA-Z0-9._]+$/, 'User ID may contain letters, numbers, dots and underscores'),
    email: z.string().trim().email('Enter a valid email address').max(255),
    fullName: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters')
      .max(150),
    mobile: z
      .string()
      .trim()
      .regex(/^\+?[0-9][0-9 -]{6,19}$/, 'Enter a valid mobile number'),
    password,
    transactionPin: pin,
    securityQuestionId: objectId,
    securityAnswer: z
      .string()
      .trim()
      .min(2, 'Security answer must be at least 2 characters')
      .max(120, 'Security answer is too long'),
  })
  .strict();

export const loginSchema = z
  .object({
    identifier: z
      .string()
      .trim()
      .min(3, 'Enter your User ID or email')
      .max(255, 'Identifier is too long'),
    password: z.string().min(1, 'Password is required').max(72),
  })
  .strict();

export const recoveryQuestionSchema = z
  .object({
    accountNumber,
    dateOfBirth,
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    accountNumber,
    dateOfBirth,
    securityAnswer: z
      .string()
      .trim()
      .min(1, 'Security answer is required')
      .max(120),
    newPassword: password,
  })
  .strict();
