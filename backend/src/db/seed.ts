import { Types } from 'mongoose';
import { Account } from '../models/account.model';
import { Atm, Branch } from '../models/directory.models';
import {
  AuditLog,
  LoginHistory,
  RefreshToken,
  SecurityQuestion,
} from '../models/auth.models';
import {
  Beneficiary,
  Bill,
  BillProvider,
  Card,
  FdDps,
  Loan,
  LoanInstallment,
  ScheduledPayment,
  Ticket,
} from '../models/banking.models';
import { IdempotencyKey } from '../models/idempotency.model';
import { Notification } from '../models/notification.model';
import { Transaction } from '../models/transaction.model';
import { User } from '../models/user.model';
import { closeDatabase, connectToDatabase } from './connect';
import {
  hashPassword,
  hashPin,
  hashSecurityAnswer,
} from '../utils/security';

const DEMO_PASSWORD = 'Demo@1234';
const DEMO_PIN = '123456';
const DEMO_SECURITY_ANSWER = 'khan';

const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number, hour = 10): Date {
  const date = new Date(Date.now() - days * DAY_MS);
  date.setUTCHours(hour, 0, 0, 0);
  return date;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]): T {
  return items[randomInt(0, items.length - 1)];
}

function reference(prefix: string): string {
  return `${prefix}${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 8)
    .toUpperCase()}`;
}

function emiPaisa(principalPaisa: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.round(principalPaisa / months);
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principalPaisa * monthlyRate * factor) / (factor - 1));
}

async function clearCollections(): Promise<void> {
  await Promise.all([
    User.deleteMany({}),
    Account.deleteMany({}),
    Transaction.deleteMany({}),
    Beneficiary.deleteMany({}),
    Card.deleteMany({}),
    Loan.deleteMany({}),
    LoanInstallment.deleteMany({}),
    FdDps.deleteMany({}),
    Bill.deleteMany({}),
    BillProvider.deleteMany({}),
    ScheduledPayment.deleteMany({}),
    Notification.deleteMany({}),
    Ticket.deleteMany({}),
    LoginHistory.deleteMany({}),
    RefreshToken.deleteMany({}),
    IdempotencyKey.deleteMany({}),
    SecurityQuestion.deleteMany({}),
    Branch.deleteMany({}),
    Atm.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
}

async function seed(): Promise<void> {
  await connectToDatabase();
  console.log('[seed] clearing existing collections');
  await clearCollections();

  const questions = await SecurityQuestion.insertMany([
    { code: 'mother_maiden', question: "What is your mother's maiden name?" },
    { code: 'first_school', question: 'What was the name of your first school?' },
    { code: 'birth_city', question: 'In which city were you born?' },
    { code: 'favorite_teacher', question: 'What was your favourite teacher’s name?' },
    { code: 'first_pet', question: 'What was the name of your first pet?' },
  ]);

  const branches = await Branch.insertMany([
    {
      code: 'DHK-DHN',
      name: 'Dhanmondi Branch',
      address: 'House 42, Road 7, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      phone: '+880 9611 000 101',
      hours: 'Sun–Thu 10:00–18:00',
      services: ['Accounts', 'Loans', 'Cards', 'FDR / DPS'],
      latitude: 23.7465,
      longitude: 90.376,
    },
    {
      code: 'DHK-GLS',
      name: 'Gulshan Branch',
      address: 'Plot 11, Road 53, Gulshan 2',
      area: 'Gulshan',
      city: 'Dhaka',
      phone: '+880 9611 000 102',
      hours: 'Sun–Thu 10:00–18:00',
      services: ['Accounts', 'Loans', 'Cards', 'Corporate Banking'],
      latitude: 23.7925,
      longitude: 90.4078,
    },
    {
      code: 'DHK-MTJ',
      name: 'Motijheel Branch',
      address: '9 Dilkusha C/A, Motijheel',
      area: 'Motijheel',
      city: 'Dhaka',
      phone: '+880 9611 000 103',
      hours: 'Sun–Thu 10:00–18:00',
      services: ['Accounts', 'Remittance', 'Loans'],
      latitude: 23.7287,
      longitude: 90.4175,
    },
    {
      code: 'DHK-UTR',
      name: 'Uttara Branch',
      address: 'Sector 7, Sonargaon Janapath',
      area: 'Uttara',
      city: 'Dhaka',
      phone: '+880 9611 000 104',
      hours: 'Sun–Thu 10:00–18:00',
      services: ['Accounts', 'Cards', 'FDR / DPS'],
      latitude: 23.8759,
      longitude: 90.3795,
    },
    {
      code: 'DHK-MRP',
      name: 'Mirpur Branch',
      address: 'Mirpur 10 Circle, Shah Ali Bagh',
      area: 'Mirpur',
      city: 'Dhaka',
      phone: '+880 9611 000 105',
      hours: 'Sun–Thu 10:00–18:00',
      services: ['Accounts', 'Loans', 'Cards'],
      latitude: 23.8069,
      longitude: 90.3687,
    },
    {
      code: 'CTG-AGR',
      name: 'Agrabad Branch',
      address: 'Sheikh Mujib Road, Agrabad',
      area: 'Agrabad',
      city: 'Chattogram',
      phone: '+880 9611 000 201',
      hours: 'Sun–Thu 10:00–18:00',
      services: ['Accounts', 'Loans', 'Remittance'],
      latitude: 22.3271,
      longitude: 91.8123,
    },
  ]);

  await Atm.insertMany([
    {
      code: 'ATM-DHN-01',
      name: 'Dhanmondi ATM Booth',
      address: 'House 42, Road 7, Dhanmondi',
      area: 'Dhanmondi',
      city: 'Dhaka',
      latitude: 23.7464,
      longitude: 90.3762,
      status: 'online',
      services: ['Cash withdrawal', 'Balance enquiry', 'PIN change'],
    },
    {
      code: 'ATM-GLS-01',
      name: 'Gulshan 2 ATM',
      address: 'Plot 11, Road 53, Gulshan 2',
      area: 'Gulshan',
      city: 'Dhaka',
      latitude: 23.7923,
      longitude: 90.4076,
      status: 'online',
      services: ['Cash withdrawal', 'Cash deposit', 'Balance enquiry'],
    },
    {
      code: 'ATM-MTJ-01',
      name: 'Motijheel ATM',
      address: '9 Dilkusha C/A, Motijheel',
      area: 'Motijheel',
      city: 'Dhaka',
      latitude: 23.7285,
      longitude: 90.4172,
      status: 'maintenance',
      services: ['Cash withdrawal', 'Balance enquiry'],
    },
    {
      code: 'ATM-UTR-01',
      name: 'Uttara Sector 7 ATM',
      address: 'Sonargaon Janapath, Sector 7',
      area: 'Uttara',
      city: 'Dhaka',
      latitude: 23.8757,
      longitude: 90.3792,
      status: 'online',
      services: ['Cash withdrawal', 'Cardless withdrawal'],
    },
    {
      code: 'ATM-MRP-01',
      name: 'Mirpur 10 ATM',
      address: 'Mirpur 10 Circle',
      area: 'Mirpur',
      city: 'Dhaka',
      latitude: 23.8067,
      longitude: 90.3685,
      status: 'online',
      services: ['Cash withdrawal', 'Balance enquiry'],
    },
    {
      code: 'ATM-AGR-01',
      name: 'Agrabad ATM',
      address: 'Sheikh Mujib Road, Agrabad',
      area: 'Agrabad',
      city: 'Chattogram',
      latitude: 22.3269,
      longitude: 91.8121,
      status: 'offline',
      services: ['Cash withdrawal'],
    },
  ]);

  const providerDocs = await BillProvider.insertMany([
    {
      code: 'dpdc',
      name: 'Dhaka Power Distribution Company',
      category: 'electricity',
      accountLabel: 'Electricity meter number',
      feePaisa: 1000,
    },
    {
      code: 'titas',
      name: 'Titas Gas Transmission',
      category: 'gas',
      accountLabel: 'Gas account number',
      feePaisa: 1000,
    },
    {
      code: 'wasa',
      name: 'Dhaka Water Supply & Sewerage',
      category: 'water',
      accountLabel: 'WASA account number',
      feePaisa: 500,
    },
    {
      code: 'link3',
      name: 'Link3 Broadband',
      category: 'internet',
      accountLabel: 'Subscriber ID',
      feePaisa: 0,
    },
    {
      code: 'grameenphone',
      name: 'Grameenphone',
      category: 'mobile',
      accountLabel: 'Mobile number',
      feePaisa: 0,
    },
    {
      code: 'brac-bank-card',
      name: 'BRAC Bank Credit Card',
      category: 'credit_card',
      accountLabel: 'Card number (last 4 digits)',
      feePaisa: 2000,
    },
  ]);

  const [passwordHash, pinHash, answerHash] = await Promise.all([
    hashPassword(DEMO_PASSWORD),
    hashPin(DEMO_PIN),
    hashSecurityAnswer(DEMO_SECURITY_ANSWER),
  ]);

  const demoUsers = [
    {
      userId: 'rahim',
      email: 'rahim@example.com',
      fullName: 'Rahim Ahmed',
      mobile: '+8801711000001',
      dateOfBirth: new Date('1990-01-15T00:00:00.000Z'),
      customerRef: 'CUST-1001',
      accounts: [
        { number: '1001000101', type: 'savings' as const, primary: true },
        { number: '1001000102', type: 'current' as const, primary: false },
      ],
    },
    {
      userId: 'nusrat',
      email: 'nusrat@example.com',
      fullName: 'Nusrat Jahan',
      mobile: '+8801711000002',
      dateOfBirth: new Date('1992-06-20T00:00:00.000Z'),
      customerRef: 'CUST-1002',
      accounts: [{ number: '1001000201', type: 'savings' as const, primary: true }],
    },
    {
      userId: 'karim',
      email: 'karim@example.com',
      fullName: 'Karim Hossain',
      mobile: '+8801711000003',
      dateOfBirth: new Date('1988-03-05T00:00:00.000Z'),
      customerRef: 'CUST-1003',
      accounts: [
        { number: '1001000301', type: 'savings' as const, primary: true },
        { number: '1001000302', type: 'current' as const, primary: false },
      ],
    },
  ];

  const users = await User.insertMany(
    demoUsers.map((user) => ({
      userId: user.userId,
      email: user.email,
      passwordHash,
      transactionPinHash: pinHash,
      fullName: user.fullName,
      mobile: user.mobile,
      dateOfBirth: user.dateOfBirth,
      securityQuestionId: questions[0]._id,
      securityAnswerHash: answerHash,
      lowBalanceThresholdPaisa: 500_000,
      lastLoginAt: daysAgo(randomInt(1, 3), 9),
      passwordChangedAt: daysAgo(120, 8),
    }))
  );

  const accountDocuments = demoUsers.flatMap((definition, index) =>
    definition.accounts.map((account, accountIndex) => ({
      accountNumber: account.number,
      userId: users[index]._id,
      customerRef: definition.customerRef,
      holderName: definition.fullName,
      accountType: account.type,
      branchCode: branches[(index + accountIndex) % 5].code,
      branchName: branches[(index + accountIndex) % 5].name,
      balancePaisa: 0,
      availableBalancePaisa: 0,
      currency: 'BDT' as const,
      status: 'active' as const,
      isPrimary: account.primary,
      dateOfBirth: definition.dateOfBirth,
      openedAt: daysAgo(500 + index * 60 + accountIndex * 20, 10),
    }))
  );

  const accounts = await Account.insertMany(accountDocuments);

  const creditDescriptions = [
    'Monthly salary credit',
    'Incoming transfer from Nusrat Jahan',
    'Cash deposit at branch',
    'Interest credit',
    'Incoming BEFTN transfer',
  ];
  const debitDescriptions = [
    'Bill payment — DPDC',
    'Mobile recharge — Grameenphone',
    'ATM cash withdrawal',
    'Card payment — Shwapno',
    'Transfer to Karim Hossain',
    'Loan installment payment',
  ];

  let transactionCounter = 0;
  for (const [accountIndex, account] of accounts.entries()) {
    const startingBalance = 8_000_000 + randomInt(0, 18) * 1_000_000;
    const count = 11 + (accountIndex % 4);
    const events = Array.from({ length: count }, (_, eventIndex) => {
      const isSalary = eventIndex === 0;
      const isCredit =
        isSalary || eventIndex % 5 === 1 || Math.random() < 0.32;
      const type = isSalary
        ? 'deposit'
        : isCredit
          ? pick(['transfer_credit', 'deposit', 'interest'] as const)
          : pick([
              'bill_payment',
              'mobile_recharge',
              'withdrawal',
              'card_payment',
              'transfer_debit',
              'loan_installment',
            ] as const);

      let amountPaisa: number;
      if (isSalary) amountPaisa = randomInt(4_000_000, 9_500_000);
      else if (type === 'interest') amountPaisa = randomInt(2_000, 20_000);
      else if (type === 'mobile_recharge') amountPaisa = randomInt(10_000, 100_000);
      else if (type === 'bill_payment') amountPaisa = randomInt(50_000, 450_000);
      else if (type === 'withdrawal') amountPaisa = randomInt(100_000, 600_000);
      else if (type === 'card_payment') amountPaisa = randomInt(50_000, 350_000);
      else amountPaisa = randomInt(100_000, 1_200_000);

      return {
        type,
        direction: isCredit ? ('credit' as const) : ('debit' as const),
        amountPaisa,
        description: isCredit ? pick(creditDescriptions) : pick(debitDescriptions),
        daysBack: Math.round(((7 - (eventIndex / count) * 6.6) + Math.random() * 0.3) * 10) / 10,
      };
    }).sort((a, b) => b.daysBack - a.daysBack);

    let balance = startingBalance;
    const transactionDocs = events.map((event) => {
      let direction = event.direction;
      let amountPaisa = event.amountPaisa;
      let type = event.type;
      let description = event.description;

      if (direction === 'debit' && balance - amountPaisa < 100_000) {
        direction = 'credit';
        type = 'deposit';
        amountPaisa = randomInt(500_000, 1_500_000);
        description = 'Cash deposit at branch';
      }

      if (direction === 'credit') balance += amountPaisa;
      else balance -= amountPaisa;

      transactionCounter += 1;
      return {
        accountId: account._id,
        userId: account.userId,
        type,
        direction,
        amountPaisa,
        feePaisa: type === 'bill_payment' ? 1000 : 0,
        balanceAfterPaisa: balance,
        referenceNumber: reference(`TXN${transactionCounter}`),
        counterpartyName:
          direction === 'debit' ? pick(['DPDC', 'Grameenphone', 'Shwapno', 'Karim Hossain']) : 'SmartBank',
        counterpartyAccount: direction === 'debit' ? `ACC${randomInt(100000, 999999)}` : null,
        description,
        status: 'completed' as const,
        channel: pick(['online', 'mobile', 'atm', 'branch'] as const),
        createdAt: daysAgo(event.daysBack, randomInt(8, 21)),
        updatedAt: new Date(),
      };
    });

    await Transaction.insertMany(transactionDocs);
    const finalBalance = Math.max(balance, 250_000);

    await Account.updateOne(
      { _id: account._id },
      { $set: { balancePaisa: finalBalance, availableBalancePaisa: finalBalance } }
    );
  }

  const primaryAccounts = accounts.filter((account) => account.isPrimary);

  const rahimPrimary = await Account.findOne({
    accountNumber: '1001000101',
  }).exec();
  const nusratPrimary = await Account.findOne({
    accountNumber: '1001000201',
  }).exec();
  if (!rahimPrimary || !nusratPrimary) {
    throw new Error('Primary demo accounts were not created.');
  }

  const pendingAmountPaisa = 150_000;
  const pendingCreatedAt = new Date(Date.now() - 2 * 60 * 1000);
  await Account.updateOne(
    { _id: rahimPrimary._id },
    {
      $inc: {
        balancePaisa: -pendingAmountPaisa,
        availableBalancePaisa: -pendingAmountPaisa,
      },
    }
  );
  const pendingWithdrawal = await Transaction.create({
    accountId: rahimPrimary._id,
    userId: rahimPrimary.userId,
    type: 'withdrawal',
    direction: 'debit',
    amountPaisa: pendingAmountPaisa,
    feePaisa: 0,
    balanceAfterPaisa: rahimPrimary.balancePaisa - pendingAmountPaisa,
    referenceNumber: reference('WDR-DEMO'),
    counterpartyName: 'Cash withdrawal',
    description: 'Demo pending withdrawal',
    status: 'pending',
    channel: 'online',
    cancelableUntil: new Date(Date.now() + 30 * 60 * 1000),
    createdAt: pendingCreatedAt,
    updatedAt: pendingCreatedAt,
  });
  await Notification.create({
    userId: rahimPrimary.userId,
    type: 'transaction',
    title: 'Withdrawal initiated',
    message: `BDT 1,500.00 is pending from account ending 0101. You can cancel it from Recent transactions before the cancellation window ends.`,
    severity: 'warning',
    isRead: false,
    metadata: {
      transactionId: pendingWithdrawal._id.toString(),
      referenceNumber: pendingWithdrawal.referenceNumber,
    },
    createdAt: pendingCreatedAt,
    updatedAt: pendingCreatedAt,
  });

  const cancelledAmountPaisa = 80_000;
  const cancelledCreatedAt = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const cancelledWithdrawal = await Transaction.create({
    accountId: nusratPrimary._id,
    userId: nusratPrimary.userId,
    type: 'withdrawal',
    direction: 'debit',
    amountPaisa: cancelledAmountPaisa,
    feePaisa: 0,
    balanceAfterPaisa: Math.max(
      0,
      nusratPrimary.balancePaisa - cancelledAmountPaisa
    ),
    referenceNumber: reference('WDR-CANCEL'),
    counterpartyName: 'Cash withdrawal',
    description: 'Cancelled demo withdrawal',
    status: 'cancelled',
    channel: 'online',
    cancelableUntil: new Date(cancelledCreatedAt.getTime() + 2 * 60 * 1000),
    cancelledAt: new Date(cancelledCreatedAt.getTime() + 60 * 1000),
    cancelledBy: 'customer',
    createdAt: cancelledCreatedAt,
    updatedAt: new Date(cancelledCreatedAt.getTime() + 60 * 1000),
  });
  await Notification.create({
    userId: nusratPrimary.userId,
    type: 'transaction',
    title: 'Withdrawal cancelled',
    message: 'BDT 800.00 was returned to account ending 0201 after a withdrawal was cancelled.',
    severity: 'success',
    isRead: true,
    readAt: new Date(cancelledCreatedAt.getTime() + 60 * 1000),
    metadata: {
      transactionId: cancelledWithdrawal._id.toString(),
      referenceNumber: cancelledWithdrawal.referenceNumber,
    },
    createdAt: new Date(cancelledCreatedAt.getTime() + 60 * 1000),
    updatedAt: new Date(cancelledCreatedAt.getTime() + 60 * 1000),
  });

  await Card.insertMany(
    users.flatMap((user, index) => {
      const account = primaryAccounts[index];
      return [
        {
          userId: user._id,
          accountId: account._id,
          cardRef: `CARD-${1000 + index}-D`,
          maskedNumber: `**** **** **** ${4200 + index * 137}`,
          cardType: 'debit' as const,
          network: index % 2 === 0 ? ('visa' as const) : ('mastercard' as const),
          status: index === 2 ? ('blocked' as const) : ('active' as const),
          expiryMonth: ((index + 3) % 12) + 1,
          expiryYear: 2029 + (index % 3),
          dailyAtmLimitPaisa: 2_500_000,
          dailyPosLimitPaisa: 10_000_000,
          monthlyOnlineLimitPaisa: 20_000_000,
          blockedAt: index === 2 ? daysAgo(3, 12) : null,
        },
        {
          userId: user._id,
          accountId: account._id,
          cardRef: `CARD-${2000 + index}-C`,
          maskedNumber: `**** **** **** ${5100 + index * 211}`,
          cardType: 'credit' as const,
          network: 'visa' as const,
          status: 'active' as const,
          expiryMonth: ((index + 7) % 12) + 1,
          expiryYear: 2030,
          dailyAtmLimitPaisa: 3_000_000,
          dailyPosLimitPaisa: 15_000_000,
          monthlyOnlineLimitPaisa: 30_000_000,
        },
      ];
    })
  );

  const loanPlans = [
    { userIndex: 0, principal: 25_000_000, rate: 11.5, months: 24, type: 'personal' as const },
    { userIndex: 2, principal: 60_000_000, rate: 9.25, months: 36, type: 'auto' as const },
  ];

  for (const [planIndex, plan] of loanPlans.entries()) {
    const emi = emiPaisa(plan.principal, plan.rate, plan.months);
    const loan = await Loan.create({
      userId: users[plan.userIndex]._id,
      accountId: primaryAccounts[plan.userIndex]._id,
      loanNumber: `LN-${2026}${String(planIndex + 1).padStart(4, '0')}`,
      loanType: plan.type,
      principalPaisa: plan.principal,
      interestRate: plan.rate,
      termMonths: plan.months,
      emiPaisa: emi,
      outstandingPaisa: plan.principal - emi * 3,
      status: 'active',
      purpose: plan.type === 'personal' ? 'Home renovation' : 'Vehicle purchase',
      appliedAt: daysAgo(160, 11),
      approvedAt: daysAgo(150, 11),
    });

    const installments = Array.from({ length: 12 }, (_, index) => {
      const dueDate = new Date(loan.approvedAt ?? new Date());
      dueDate.setUTCMonth(dueDate.getUTCMonth() + index + 1);
      const interest = Math.round((plan.principal * (plan.rate / 100)) / 12);
      return {
        userId: users[plan.userIndex]._id,
        loanId: loan._id,
        installmentNumber: index + 1,
        dueDate,
        amountPaisa: emi,
        principalPaisa: Math.max(emi - interest, 0),
        interestPaisa: interest,
        status: index < 3 ? ('paid' as const) : index === 3 ? ('overdue' as const) : ('pending' as const),
        paidAt: index < 3 ? daysAgo(30 - index * 5, 12) : null,
      };
    });

    await LoanInstallment.insertMany(installments);
  }

  await FdDps.insertMany([
    {
      userId: users[0]._id,
      accountId: primaryAccounts[0]._id,
      type: 'fdr',
      referenceNumber: 'FDR-2026-0001',
      principalPaisa: 50_000_000,
      balancePaisa: 51_875_000,
      interestRate: 9.5,
      tenureMonths: 12,
      monthlyDepositPaisa: 0,
      maturityAmountPaisa: 54_750_000,
      status: 'active',
      openedAt: daysAgo(200, 11),
      maturityDate: daysAgo(-165, 11),
    },
    {
      userId: users[1]._id,
      accountId: primaryAccounts[1]._id,
      type: 'dps',
      referenceNumber: 'DPS-2026-0001',
      principalPaisa: 600_000,
      balancePaisa: 1_800_000,
      interestRate: 7.25,
      tenureMonths: 36,
      monthlyDepositPaisa: 600_000,
      maturityAmountPaisa: 24_600_000,
      status: 'active',
      openedAt: daysAgo(90, 9),
      maturityDate: daysAgo(-1005, 9),
    },
  ]);

  await Beneficiary.insertMany([
    {
      userId: users[0]._id,
      name: 'Nusrat Jahan',
      accountNumber: '1001000201',
      bankName: 'SmartBank',
      bankCode: 'SMART',
      branchName: 'Gulshan Branch',
      transferType: 'same_bank',
      nickname: 'Nusrat',
      isFavorite: true,
      lastUsedAt: daysAgo(2, 14),
    },
    {
      userId: users[0]._id,
      name: 'Karim Hossain',
      accountNumber: '1001000301',
      bankName: 'SmartBank',
      bankCode: 'SMART',
      branchName: 'Motijheel Branch',
      transferType: 'same_bank',
      nickname: 'Karim',
      isFavorite: false,
      lastUsedAt: daysAgo(5, 17),
    },
    {
      userId: users[0]._id,
      name: 'Rahim Ahmed',
      accountNumber: '1001000102',
      bankName: 'SmartBank',
      bankCode: 'SMART',
      branchName: 'Gulshan Branch',
      transferType: 'own',
      nickname: 'My current account',
      isFavorite: true,
    },
    {
      userId: users[1]._id,
      name: 'Rahim Ahmed',
      accountNumber: '1001000101',
      bankName: 'SmartBank',
      bankCode: 'SMART',
      branchName: 'Dhanmondi Branch',
      transferType: 'same_bank',
      nickname: 'Rahim',
      isFavorite: true,
      lastUsedAt: daysAgo(4, 10),
    },
    {
      userId: users[2]._id,
      name: 'Tanvir Islam',
      accountNumber: '0123456789012',
      bankName: 'Dutch-Bangla Bank',
      bankCode: 'DBBL',
      branchName: 'Uttara Branch',
      transferType: 'other_bank',
      nickname: 'Tanvir (DBBL)',
      isFavorite: false,
      lastUsedAt: daysAgo(6, 16),
    },
  ]);

  await Bill.insertMany(
    users.slice(0, 3).flatMap((user, index) => [
      {
        userId: user._id,
        accountId: primaryAccounts[index]._id,
        providerId: providerDocs[index % providerDocs.length]._id,
        billNumber: `BILL-${1000 + index}`,
        amountPaisa: 150_000 + index * 45_000,
        feePaisa: 1000,
        status: 'paid' as const,
        referenceNumber: `BILLPAY-2026-${100 + index}`,
        paidAt: daysAgo(3 + index, 12),
      },
      {
        userId: user._id,
        accountId: primaryAccounts[index]._id,
        providerId: providerDocs[4]._id,
        billNumber: user.mobile,
        amountPaisa: 50_000 + index * 10_000,
        feePaisa: 0,
        status: 'paid' as const,
        referenceNumber: `RECHARGE-2026-${200 + index}`,
        paidAt: daysAgo(5 + index, 18),
      },
    ])
  );

  await ScheduledPayment.insertMany([
    {
      userId: users[0]._id,
      accountId: primaryAccounts[0]._id,
      type: 'bill',
      name: 'DPDC electricity bill',
      amountPaisa: 185_000,
      dayOfMonth: 10,
      nextRunAt: daysAgo(-7, 9),
      status: 'active',
      providerId: providerDocs[0]._id,
      billNumber: 'METER-778812',
    },
    {
      userId: users[1]._id,
      accountId: primaryAccounts[1]._id,
      type: 'mobile_recharge',
      name: 'Grameenphone monthly recharge',
      amountPaisa: 60_000,
      dayOfMonth: 5,
      nextRunAt: daysAgo(-4, 9),
      status: 'active',
      providerId: providerDocs[4]._id,
      billNumber: users[1].mobile,
    },
  ]);

  await Ticket.insertMany([
    {
      userId: users[0]._id,
      ticketNumber: 'TKT-2026-0001',
      subject: 'Debit card not working at ATM',
      category: 'card',
      priority: 'high',
      status: 'in_progress',
      messages: [
        {
          sender: 'customer',
          message: 'My debit card was declined at the Gulshan ATM this morning.',
          createdAt: daysAgo(2, 9),
        },
        {
          sender: 'bank',
          message: 'We are checking the card status and will update you shortly.',
          createdAt: daysAgo(1, 11),
        },
      ],
    },
    {
      userId: users[2]._id,
      ticketNumber: 'TKT-2026-0002',
      subject: 'Statement request for auto loan',
      category: 'loan',
      priority: 'normal',
      status: 'resolved',
      messages: [
        {
          sender: 'customer',
          message: 'Please provide a loan statement for the last six months.',
          createdAt: daysAgo(5, 14),
        },
        {
          sender: 'bank',
          message: 'The statement is now available from the account statement page.',
          createdAt: daysAgo(4, 10),
        },
      ],
    },
  ]);

  await Notification.insertMany([
    ...users.map((user, index) => ({
      userId: user._id,
      type: 'welcome' as const,
      title: 'Welcome to SmartBank',
      message: `Hi ${user.fullName}, your online banking is active. Use the dashboard to track balances and transactions.`,
      severity: 'success' as const,
      isRead: true,
      readAt: daysAgo(20, 10),
      createdAt: daysAgo(21 + index, 10),
    })),
    ...users.slice(0, 3).map((user, index) => ({
      userId: user._id,
      type: 'transaction' as const,
      title: 'Transaction alert',
      message: `BDT ${(1500 + index * 250).toLocaleString('en-US')} was debited from your account for a recent bill payment.`,
      severity: 'info' as const,
      isRead: false,
      createdAt: daysAgo(1 + index, 13),
    })),
  ]);

  await LoginHistory.insertMany(
    users.flatMap((user, index) => [
      {
        userId: user._id,
        device: index % 2 === 0 ? 'Desktop' : 'Mobile',
        browser: index % 2 === 0 ? 'Chrome' : 'Safari',
        ipAddress: `103.108.${40 + index}.12`,
        location: index % 3 === 0 ? 'Dhaka, BD' : 'Chattogram, BD',
        status: 'success' as const,
        createdAt: daysAgo(6 + index, 9),
      },
      {
        userId: user._id,
        device: 'Desktop',
        browser: 'Firefox',
        ipAddress: `103.108.${60 + index}.44`,
        location: 'Dhaka, BD',
        status: 'failed' as const,
        failureReason: 'Incorrect password',
        createdAt: daysAgo(10 + index, 21),
      },
    ])
  );

  await AuditLog.insertMany(
    users.flatMap((user, index) => [
      {
        userId: user._id,
        action: 'user_login',
        entityType: 'user',
        entityId: user._id.toString(),
        ipAddress: `103.108.${40 + index}.12`,
        userAgent: 'Mozilla/5.0 seed data',
        metadata: { seeded: true },
        createdAt: daysAgo(6 + index, 9),
      },
      {
        userId: user._id,
        action: 'statement_download',
        entityType: 'account',
        entityId: primaryAccounts[index]._id.toString(),
        ipAddress: `103.108.${40 + index}.12`,
        userAgent: 'Mozilla/5.0 seed data',
        metadata: { format: 'pdf' },
        createdAt: daysAgo(4 + index, 15),
      },
    ])
  );

  await Promise.all([
    User.createIndexes(),
    Account.createIndexes(),
    Transaction.createIndexes(),
    IdempotencyKey.createIndexes(),
    Notification.createIndexes(),
    LoginHistory.createIndexes(),
    AuditLog.createIndexes(),
  ]);

  console.log('');
  console.log('[seed] Seed complete');
  console.log('[seed] Demo users (password for all: Demo@1234, transaction PIN: 123456)');
  for (const user of demoUsers) {
    console.log(`  - ${user.userId} / ${user.email}`);
  }
  console.log('[seed] Security answer for all demo users: khan');
  console.log(`[seed] Bill providers: ${providerDocs.length}, branches: ${branches.length}, accounts: ${accounts.length}`);
  console.log('');
}

seed()
  .then(async () => {
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('[seed] failed', error instanceof Error ? error.message : error);
    await closeDatabase().catch(() => undefined);
    process.exit(1);
  });
