import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Atm } from '../models/Atm';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildMeta, sendSuccess } from '../utils/response';
import { toCsv } from '../utils/csv';

const buildFilter = (query: Record<string, unknown>): Record<string, unknown> => {
  const filter: Record<string, unknown> = {};
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  if (query.atm) {
    filter.$or = [
      { atm: query.atm },
      { atmCode: { $regex: String(query.atm), $options: 'i' } },
      { reference: { $regex: String(query.atm), $options: 'i' } },
    ];
  }
  if (query.search) {
    const search = String(query.search);
    filter.$or = [
      { reference: { $regex: search, $options: 'i' } },
      { atmCode: { $regex: search, $options: 'i' } },
      { cardMasked: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
    ];
  }
  if (query.from || query.to) {
    const createdAt: Record<string, Date> = {};
    if (query.from) createdAt.$gte = new Date(String(query.from));
    if (query.to) {
      const to = new Date(String(query.to));
      to.setUTCHours(23, 59, 59, 999);
      createdAt.$lte = to;
    }
    filter.createdAt = createdAt;
  }
  return filter;
};

const buildSort = (sort?: unknown): Record<string, 1 | -1> => {
  switch (sort) {
    case 'oldest':
      return { createdAt: 1 };
    case 'amount_desc':
      return { amount: -1 };
    case 'amount_asc':
      return { amount: 1 };
    default:
      return { createdAt: -1 };
  }
};

export const listTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1) || 1;
    const limit = Math.min(Number(req.query.limit ?? 20) || 20, 200);
    const skip = (page - 1) * limit;
    const filter = buildFilter(req.query as Record<string, unknown>);

    const [items, total] = await Promise.all([
      Transaction.find(filter)
        .sort(buildSort(req.query.sort))
        .skip(skip)
        .limit(limit)
        .populate('atm', 'atmId name area')
        .lean(),
      Transaction.countDocuments(filter),
    ]);

    return sendSuccess(res, items, 'Transactions', buildMeta(total, page, limit));
  }
);

export const getTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const txn = await Transaction.findById(req.params.id).populate(
      'atm',
      'atmId name area location'
    );
    if (!txn) throw ApiError.notFound('Transaction not found');
    return sendSuccess(res, txn, 'Transaction');
  }
);

export const createTransaction = asyncHandler(
  async (req: Request, res: Response) => {
    const atm = await Atm.findById(req.body.atm);
    if (!atm) throw ApiError.notFound('ATM not found');

    const amount = Number(req.body.amount ?? 0);

    if (req.body.type === 'withdrawal') {
      if (atm.status !== 'online') {
        throw ApiError.badRequest(`ATM is ${atm.status}, cannot dispense cash`);
      }
      if (atm.cash < amount) {
        throw ApiError.badRequest('Insufficient cash in ATM');
      }
      atm.cash -= amount;
      if (amount > 0) {
        const notes = atm.denominations;
        let remaining = amount;
        const denominations = [1000, 500, 200, 100, 50];
        const fields = [
          'thousand',
          'fiveHundred',
          'twoHundred',
          'oneHundred',
          'fifty',
        ] as const;
        for (let i = 0; i < denominations.length; i += 1) {
          const take = Math.min(
            Math.floor(remaining / denominations[i]),
            notes[fields[i]] ?? 0
          );
          notes[fields[i]] = (notes[fields[i]] ?? 0) - take;
          remaining -= take * denominations[i];
        }
      }
      await atm.save();
    } else if (req.body.type === 'deposit') {
      atm.cash = Math.min(atm.capacity, atm.cash + amount);
      await atm.save();
    }

    const reference = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const txn = await Transaction.create({
      ...req.body,
      reference,
      atmCode: atm.atmId,
      status: req.body.status ?? 'success',
    });

    return sendSuccess(res, txn, 'Transaction recorded', undefined, 201);
  }
);

export const exportTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const filter = buildFilter(req.query as Record<string, unknown>);
    const rows = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(5000)
      .populate('atm', 'atmId name')
      .lean();

    const csv = toCsv(
      rows.map((row) => {
        const atm = row.atm as unknown as { atmId?: string } | null;
        return {
          reference: row.reference,
          date: new Date(row.createdAt).toISOString(),
          atmId: atm?.atmId ?? row.atmCode,
          type: row.type,
          amount: row.amount,
          fee: row.fee,
          status: row.status,
          card: row.cardMasked,
          customer: row.customerName,
        };
      }),
      [
        'reference',
        'date',
        'atmId',
        'type',
        'amount',
        'fee',
        'status',
        'card',
        'customer',
      ]
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="transactions-${Date.now()}.csv"`
    );
    return res.status(200).send(csv || 'reference,date,atmId\n');
  }
);
