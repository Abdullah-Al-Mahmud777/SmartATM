import { Schema, Model, Types, model, models } from 'mongoose';

export interface IBeneficiary {
  userId: Types.ObjectId;
  name: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
  branchName?: string | null;
  transferType: 'own' | 'same_bank' | 'other_bank';
  nickname?: string | null;
  isFavorite: boolean;
  lastUsedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const beneficiarySchema = new Schema<IBeneficiary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    accountNumber: { type: String, required: true, trim: true, maxlength: 40 },
    bankName: { type: String, required: true, trim: true, maxlength: 120 },
    bankCode: { type: String, required: true, trim: true, maxlength: 20 },
    branchName: { type: String, default: null, trim: true, maxlength: 120 },
    transferType: {
      type: String,
      enum: ['own', 'same_bank', 'other_bank'],
      required: true,
    },
    nickname: { type: String, default: null, trim: true, maxlength: 80 },
    isFavorite: { type: Boolean, default: false },
    lastUsedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: 'beneficiaries' }
);

beneficiarySchema.index(
  { userId: 1, accountNumber: 1, bankCode: 1 },
  { unique: true }
);

export const Beneficiary: Model<IBeneficiary> =
  (models.Beneficiary as Model<IBeneficiary> | undefined) ??
  model<IBeneficiary>('Beneficiary', beneficiarySchema);

export interface ICard {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  cardRef: string;
  maskedNumber: string;
  cardType: 'debit' | 'credit';
  network: 'visa' | 'mastercard' | 'amex';
  status: 'active' | 'blocked' | 'expired' | 'pending' | 'cancelled';
  expiryMonth: number;
  expiryYear: number;
  dailyAtmLimitPaisa: number;
  dailyPosLimitPaisa: number;
  monthlyOnlineLimitPaisa: number;
  requestedAt?: Date | null;
  blockedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    cardRef: { type: String, required: true, trim: true },
    maskedNumber: { type: String, required: true, trim: true, maxlength: 25 },
    cardType: { type: String, enum: ['debit', 'credit'], required: true },
    network: { type: String, enum: ['visa', 'mastercard', 'amex'], required: true },
    status: {
      type: String,
      enum: ['active', 'blocked', 'expired', 'pending', 'cancelled'],
      default: 'active',
    },
    expiryMonth: { type: Number, required: true, min: 1, max: 12 },
    expiryYear: { type: Number, required: true, min: 2024, max: 2100 },
    dailyAtmLimitPaisa: { type: Number, default: 2_500_000, min: 0 },
    dailyPosLimitPaisa: { type: Number, default: 10_000_000, min: 0 },
    monthlyOnlineLimitPaisa: { type: Number, default: 20_000_000, min: 0 },
    requestedAt: { type: Date, default: null },
    blockedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: 'cards' }
);

cardSchema.index({ cardRef: 1 }, { unique: true });
cardSchema.index({ userId: 1, status: 1 });

export const Card: Model<ICard> =
  (models.Card as Model<ICard> | undefined) ??
  model<ICard>('Card', cardSchema);

export interface ILoan {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  loanNumber: string;
  loanType: 'personal' | 'home' | 'auto' | 'education';
  principalPaisa: number;
  interestRate: number;
  termMonths: number;
  emiPaisa: number;
  outstandingPaisa: number;
  status: 'submitted' | 'active' | 'closed' | 'rejected';
  purpose?: string | null;
  appliedAt: Date;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    loanNumber: { type: String, required: true, trim: true },
    loanType: {
      type: String,
      enum: ['personal', 'home', 'auto', 'education'],
      required: true,
    },
    principalPaisa: { type: Number, required: true, min: 1 },
    interestRate: { type: Number, required: true, min: 0, max: 100 },
    termMonths: { type: Number, required: true, min: 1, max: 360 },
    emiPaisa: { type: Number, required: true, min: 0 },
    outstandingPaisa: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['submitted', 'active', 'closed', 'rejected'],
      default: 'submitted',
    },
    purpose: { type: String, default: null, trim: true, maxlength: 300 },
    appliedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: 'loans' }
);

loanSchema.index({ loanNumber: 1 }, { unique: true });
loanSchema.index({ userId: 1, status: 1 });

export const Loan: Model<ILoan> =
  (models.Loan as Model<ILoan> | undefined) ??
  model<ILoan>('Loan', loanSchema);

export interface ILoanInstallment {
  userId: Types.ObjectId;
  loanId: Types.ObjectId;
  installmentNumber: number;
  dueDate: Date;
  amountPaisa: number;
  principalPaisa: number;
  interestPaisa: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date | null;
  transactionId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const loanInstallmentSchema = new Schema<ILoanInstallment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true, index: true },
    installmentNumber: { type: Number, required: true, min: 1 },
    dueDate: { type: Date, required: true },
    amountPaisa: { type: Number, required: true, min: 1 },
    principalPaisa: { type: Number, required: true, min: 0 },
    interestPaisa: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    paidAt: { type: Date, default: null },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', default: null },
  },
  { timestamps: true, versionKey: false, collection: 'loanInstallments' }
);

loanInstallmentSchema.index({ loanId: 1, installmentNumber: 1 }, { unique: true });
loanInstallmentSchema.index({ userId: 1, status: 1, dueDate: 1 });

export const LoanInstallment: Model<ILoanInstallment> =
  (models.LoanInstallment as Model<ILoanInstallment> | undefined) ??
  model<ILoanInstallment>('LoanInstallment', loanInstallmentSchema);

export interface IFdDps {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  type: 'fdr' | 'dps';
  referenceNumber: string;
  principalPaisa: number;
  balancePaisa: number;
  interestRate: number;
  tenureMonths: number;
  monthlyDepositPaisa: number;
  maturityAmountPaisa: number;
  status: 'active' | 'matured' | 'closed';
  openedAt: Date;
  maturityDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const fdDpsSchema = new Schema<IFdDps>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    type: { type: String, enum: ['fdr', 'dps'], required: true },
    referenceNumber: { type: String, required: true, trim: true },
    principalPaisa: { type: Number, required: true, min: 1 },
    balancePaisa: { type: Number, required: true, min: 0 },
    interestRate: { type: Number, required: true, min: 0, max: 100 },
    tenureMonths: { type: Number, required: true, min: 1, max: 600 },
    monthlyDepositPaisa: { type: Number, default: 0, min: 0 },
    maturityAmountPaisa: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['active', 'matured', 'closed'], default: 'active' },
    openedAt: { type: Date, default: Date.now },
    maturityDate: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false, collection: 'fdDps' }
);

fdDpsSchema.index({ referenceNumber: 1 }, { unique: true });
fdDpsSchema.index({ userId: 1, type: 1, status: 1 });

export const FdDps: Model<IFdDps> =
  (models.FdDps as Model<IFdDps> | undefined) ??
  model<IFdDps>('FdDps', fdDpsSchema);

export type BillCategory =
  | 'electricity'
  | 'gas'
  | 'water'
  | 'internet'
  | 'mobile'
  | 'credit_card';

export interface IBillProvider {
  code: string;
  name: string;
  category: BillCategory;
  accountLabel: string;
  feePaisa: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const billProviderSchema = new Schema<IBillProvider>(
  {
    code: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    category: {
      type: String,
      enum: ['electricity', 'gas', 'water', 'internet', 'mobile', 'credit_card'],
      required: true,
    },
    accountLabel: { type: String, required: true, trim: true, maxlength: 80 },
    feePaisa: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: 'billProviders' }
);

billProviderSchema.index({ code: 1 }, { unique: true });
billProviderSchema.index({ category: 1, isActive: 1 });

export const BillProvider: Model<IBillProvider> =
  (models.BillProvider as Model<IBillProvider> | undefined) ??
  model<IBillProvider>('BillProvider', billProviderSchema);

export interface IBill {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  providerId: Types.ObjectId;
  billNumber: string;
  amountPaisa: number;
  feePaisa: number;
  status: 'pending' | 'paid' | 'failed';
  referenceNumber: string;
  transactionId?: Types.ObjectId | null;
  paidAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const billSchema = new Schema<IBill>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    providerId: {
      type: Schema.Types.ObjectId,
      ref: 'BillProvider',
      required: true,
      index: true,
    },
    billNumber: { type: String, required: true, trim: true, maxlength: 80 },
    amountPaisa: { type: Number, required: true, min: 1 },
    feePaisa: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    referenceNumber: { type: String, required: true, trim: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', default: null },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: 'bills' }
);

billSchema.index({ referenceNumber: 1 }, { unique: true });
billSchema.index({ userId: 1, createdAt: -1 });

export const Bill: Model<IBill> =
  (models.Bill as Model<IBill> | undefined) ??
  model<IBill>('Bill', billSchema);

export interface IScheduledPayment {
  userId: Types.ObjectId;
  accountId: Types.ObjectId;
  type: 'bill' | 'mobile_recharge' | 'transfer';
  name: string;
  amountPaisa: number;
  frequency: 'monthly';
  dayOfMonth: number;
  nextRunAt: Date;
  lastRunAt?: Date | null;
  status: 'active' | 'cancelled' | 'completed';
  providerId?: Types.ObjectId | null;
  billNumber?: string | null;
  beneficiaryId?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const scheduledPaymentSchema = new Schema<IScheduledPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    type: {
      type: String,
      enum: ['bill', 'mobile_recharge', 'transfer'],
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    amountPaisa: { type: Number, required: true, min: 1 },
    frequency: { type: String, enum: ['monthly'], default: 'monthly' },
    dayOfMonth: { type: Number, required: true, min: 1, max: 28 },
    nextRunAt: { type: Date, required: true },
    lastRunAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
    providerId: { type: Schema.Types.ObjectId, ref: 'BillProvider', default: null },
    billNumber: { type: String, default: null, trim: true, maxlength: 80 },
    beneficiaryId: { type: Schema.Types.ObjectId, ref: 'Beneficiary', default: null },
  },
  { timestamps: true, versionKey: false, collection: 'scheduledPayments' }
);

scheduledPaymentSchema.index({ nextRunAt: 1, status: 1 });
scheduledPaymentSchema.index({ userId: 1, status: 1 });

export const ScheduledPayment: Model<IScheduledPayment> =
  (models.ScheduledPayment as Model<IScheduledPayment> | undefined) ??
  model<IScheduledPayment>('ScheduledPayment', scheduledPaymentSchema);

export interface TicketMessage {
  sender: 'customer' | 'bank';
  message: string;
  createdAt: Date;
}

export interface ITicket {
  userId: Types.ObjectId;
  ticketNumber: string;
  subject: string;
  category: 'account' | 'card' | 'transfer' | 'loan' | 'other';
  priority: 'low' | 'normal' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  messages: TicketMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ticketMessageSchema = new Schema<TicketMessage>(
  {
    sender: { type: String, enum: ['customer', 'bank'], required: true },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ticketSchema = new Schema<ITicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    ticketNumber: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    category: {
      type: String,
      enum: ['account', 'card', 'transfer', 'loan', 'other'],
      required: true,
    },
    priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    messages: { type: [ticketMessageSchema], default: [] },
  },
  { timestamps: true, versionKey: false, collection: 'tickets' }
);

ticketSchema.index({ ticketNumber: 1 }, { unique: true });
ticketSchema.index({ userId: 1, createdAt: -1 });

export const Ticket: Model<ITicket> =
  (models.Ticket as Model<ITicket> | undefined) ??
  model<ITicket>('Ticket', ticketSchema);
