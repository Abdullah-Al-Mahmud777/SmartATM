import { Request, Response } from 'express';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { FilterQuery, Types } from 'mongoose';
import { Account } from '../../models/account.model';
import { ITransaction, Transaction } from '../../models/transaction.model';
import { findOwnedAccount } from '../../utils/accountAccess';
import { asyncHandler } from '../../utils/asyncHandler';
import { writeAudit } from '../../utils/audit';
import { getRequestMeta } from '../../utils/requestMeta';
import { sendSuccess } from '../../utils/response';
import { escapeRegex } from '../../utils/security';
import { serializeAccount, serializeTransaction } from '../../utils/serializers';

interface TransactionQueryInput {
  search?: string;
  type?: ITransaction['type'];
  direction?: 'debit' | 'credit';
  status?: ITransaction['status'];
  from?: string;
  to?: string;
  minAmountPaisa?: number;
  maxAmountPaisa?: number;
  page: number;
  limit: number;
  accountId?: string;
}

function startOfDay(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function endOfDay(value: string): Date {
  return new Date(`${value}T23:59:59.999Z`);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatMoney(paisa: number): string {
  return (paisa / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDateTime(value: Date): string {
  return value.toLocaleString('en-GB', {
    timeZone: 'Asia/Dhaka',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function buildTransactionFilter(
  userId: string,
  filters: TransactionQueryInput
): FilterQuery<ITransaction> {
  const query: FilterQuery<ITransaction> = { userId: new Types.ObjectId(userId) };

  if (filters.accountId) {
    query.accountId = new Types.ObjectId(filters.accountId);
  }
  if (filters.type) query.type = filters.type;
  if (filters.direction) query.direction = filters.direction;
  if (filters.status) query.status = filters.status;

  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) query.createdAt.$gte = startOfDay(filters.from);
    if (filters.to) query.createdAt.$lte = endOfDay(filters.to);
  }

  if (filters.minAmountPaisa !== undefined || filters.maxAmountPaisa !== undefined) {
    query.amountPaisa = {};
    if (filters.minAmountPaisa !== undefined) {
      query.amountPaisa.$gte = filters.minAmountPaisa;
    }
    if (filters.maxAmountPaisa !== undefined) {
      query.amountPaisa.$lte = filters.maxAmountPaisa;
    }
  }

  if (filters.search) {
    const pattern = new RegExp(escapeRegex(filters.search), 'i');
    query.$or = [
      { description: pattern },
      { counterpartyName: pattern },
      { counterpartyAccount: pattern },
      { referenceNumber: pattern },
    ];
  }

  return query;
}

async function listTransactions(req: Request, accountId?: string) {
  const filters = req.query as unknown as TransactionQueryInput;
  const query = buildTransactionFilter(req.user!.id, { ...filters, accountId });

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((filters.page - 1) * filters.limit)
      .limit(filters.limit)
      .lean()
      .exec(),
    Transaction.countDocuments(query),
  ]);

  return {
    transactions: transactions.map(serializeTransaction),
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  };
}

export const listAccounts = asyncHandler(async (req: Request, res: Response) => {
  const accounts = await Account.find({ userId: req.user!.id })
    .sort({ isPrimary: -1, createdAt: 1 })
    .exec();
  sendSuccess(res, accounts.map(serializeAccount));
});

export const getAccount = asyncHandler(async (req: Request, res: Response) => {
  const account = await findOwnedAccount(req.user!.id, req.params.id);
  sendSuccess(res, serializeAccount(account));
});

export const getAccountTransactions = asyncHandler(async (req: Request, res: Response) => {
  const account = await findOwnedAccount(req.user!.id, req.params.id);
  const { transactions, meta } = await listTransactions(req, account._id.toString());
  sendSuccess(res, transactions, 'OK', 200, meta);
});

export const listAllTransactions = asyncHandler(async (req: Request, res: Response) => {
  const accountId = (req.query as { accountId?: string }).accountId;
  if (accountId) {
    await findOwnedAccount(req.user!.id, accountId);
  }
  const { transactions, meta } = await listTransactions(req, accountId);
  sendSuccess(res, transactions, 'OK', 200, meta);
});

export const downloadStatement = asyncHandler(async (req: Request, res: Response) => {
  const account = await findOwnedAccount(req.user!.id, req.params.id);
  const queryInput = req.query as unknown as {
    format: 'pdf' | 'xlsx';
    from?: string;
    to?: string;
  };
  const from = queryInput.from ?? daysAgo(30);
  const to = queryInput.to ?? today();

  const transactions = await Transaction.find({
    userId: req.user!.id,
    accountId: account._id,
    createdAt: { $gte: startOfDay(from), $lte: endOfDay(to) },
  })
    .sort({ createdAt: 1 })
    .limit(5000)
    .lean()
    .exec();

  await writeAudit({
    userId: req.user!.id,
    action: 'statement_download',
    entityType: 'account',
    entityId: account._id.toString(),
    meta: getRequestMeta(req),
    metadata: { format: queryInput.format, from, to },
  });

  const filename = `statement-${account.accountNumber}-${from}-to-${to}`;

  if (queryInput.format === 'xlsx') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'SmartBank';
    workbook.created = new Date();
    const sheet = workbook.addWorksheet('Statement');

    sheet.columns = [
      { header: 'Date', key: 'date', width: 24 },
      { header: 'Reference', key: 'reference', width: 26 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Counterparty', key: 'counterparty', width: 30 },
      { header: 'Debit (BDT)', key: 'debit', width: 16 },
      { header: 'Credit (BDT)', key: 'credit', width: 16 },
      { header: 'Balance (BDT)', key: 'balance', width: 18 },
    ];

    sheet.mergeCells('A1:H1');
    sheet.getCell('A1').value = 'SMARTBANK - ACCOUNT STATEMENT';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF1D4ED8' } };
    sheet.mergeCells('A2:H2');
    sheet.getCell('A2').value =
      `Account ${account.accountNumber} · ${account.accountType.toUpperCase()} · ${account.branchName}`;
    sheet.mergeCells('A3:H3');
    sheet.getCell('A3').value = `Period: ${from} to ${to} · Currency: BDT`;
    sheet.addRow([]);

    const headerRow = sheet.addRow([
      'Date',
      'Reference',
      'Type',
      'Description',
      'Counterparty',
      'Debit (BDT)',
      'Credit (BDT)',
      'Balance (BDT)',
    ]);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1D4ED8' },
    };
    sheet.views = [{ state: 'frozen', ySplit: headerRow.number }];

    if (!transactions.length) {
      const empty = sheet.addRow(['No transactions in this period']);
      sheet.mergeCells(`A${empty.number}:H${empty.number}`);
    }

    transactions.forEach((transaction) => {
      sheet.addRow([
        formatDateTime(transaction.createdAt),
        transaction.referenceNumber,
        transaction.type.replaceAll('_', ' '),
        transaction.description ?? '',
        transaction.counterpartyName ?? '',
        transaction.direction === 'debit' ? transaction.amountPaisa / 100 : '',
        transaction.direction === 'credit' ? transaction.amountPaisa / 100 : '',
        transaction.balanceAfterPaisa / 100,
      ]);
    });
    sheet.getColumn('debit').numFmt = '#,##0.00';
    sheet.getColumn('credit').numFmt = '#,##0.00';
    sheet.getColumn('balance').numFmt = '#,##0.00';

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.pdf"`);
  const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  doc.pipe(res);

  doc.fillColor('#1d4ed8').fontSize(20).font('Helvetica-Bold').text('SMARTBANK');
  doc.fillColor('#0f172a').fontSize(13).text('Account Statement');
  doc.moveDown(0.6);

  doc.font('Helvetica').fontSize(9).fillColor('#334155');
  doc.text(`Account number: ${account.accountNumber}`);
  doc.text(
    `Account type: ${account.accountType.toUpperCase()} · Branch: ${account.branchName}`
  );
  doc.text(`Period: ${from} to ${to} · Currency: BDT`);
  doc.moveDown(0.8);

  const columns = { date: 40, ref: 120, desc: 220, debit: 380, credit: 440, balance: 500 };
  const drawHeader = () => {
    const y = doc.y;
    doc.fillColor('#e2e8f0').rect(40, y - 2, 515, 18).fill();
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(8);
    doc.text('Date', columns.date, y + 3, { width: 76 });
    doc.text('Reference', columns.ref, y + 3, { width: 94 });
    doc.text('Description', columns.desc, y + 3, { width: 154 });
    doc.text('Debit', columns.debit, y + 3, { width: 54, align: 'right' });
    doc.text('Credit', columns.credit, y + 3, { width: 54, align: 'right' });
    doc.text('Balance', columns.balance, y + 3, { width: 55, align: 'right' });
    doc.y = y + 20;
    doc.font('Helvetica').fontSize(8);
  };

  drawHeader();

  if (!transactions.length) {
    doc.text('No transactions in this period.', 40, doc.y + 6);
  }

  let totalDebit = 0;
  let totalCredit = 0;

  transactions.forEach((transaction) => {
    if (doc.y > 740) {
      doc.addPage();
      drawHeader();
    }
    const y = doc.y;
    const debit = transaction.direction === 'debit' ? transaction.amountPaisa : 0;
    const credit = transaction.direction === 'credit' ? transaction.amountPaisa : 0;
    totalDebit += debit;
    totalCredit += credit;

    doc.fillColor('#334155');
    doc.text(formatDateTime(transaction.createdAt), columns.date, y, { width: 76 });
    doc.text(transaction.referenceNumber, columns.ref, y, { width: 94 });
    doc.text(
      (transaction.description ?? transaction.type.replaceAll('_', ' ')).slice(0, 44),
      columns.desc,
      y,
      { width: 154 }
    );
    doc.text(debit ? formatMoney(debit) : '—', columns.debit, y, {
      width: 54,
      align: 'right',
    });
    doc.text(credit ? formatMoney(credit) : '—', columns.credit, y, {
      width: 54,
      align: 'right',
    });
    doc.text(formatMoney(transaction.balanceAfterPaisa), columns.balance, y, {
      width: 55,
      align: 'right',
    });
    doc.y = y + 14;
    doc.moveTo(40, doc.y - 3).lineTo(555, doc.y - 3).strokeColor('#e2e8f0').stroke();
  });

  doc.moveDown(0.8);
  doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(9);
  doc.text(`Total debits: BDT ${formatMoney(totalDebit)}`, 360, doc.y, {
    width: 195,
    align: 'right',
  });
  doc.text(`Total credits: BDT ${formatMoney(totalCredit)}`, 360, doc.y, {
    width: 195,
    align: 'right',
  });
  doc.moveDown(1);
  doc.font('Helvetica').fontSize(8).fillColor('#64748b');
  doc.text(
    'This is a computer-generated statement and does not require a signature. For queries, contact SmartBank support from the app.',
    40,
    doc.y,
    { width: 515 }
  );

  doc.end();
});
