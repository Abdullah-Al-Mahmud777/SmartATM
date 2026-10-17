import { connectDB, disconnectDB } from './config/db';
import { User } from './models/User';
import { Atm, AtmStatus } from './models/Atm';
import { Transaction, TransactionType } from './models/Transaction';
import { Alert, AlertSeverity } from './models/Alert';
import { Maintenance } from './models/Maintenance';
import { Settings } from './models/Settings';
import { env } from './config/env';

const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[rand(0, arr.length - 1)];

const AREAS = [
  { area: 'Gulshan', lat: 23.7808, lng: 90.4152, spots: ['Gulshan Avenue', 'Gulshan Circle 1', 'Gulshan Circle 2', 'Gulshan South'] },
  { area: 'Banani', lat: 23.7936, lng: 90.4043, spots: ['Banani Road 11', 'Banani Chairman Bari', 'Banani Graveyard'] },
  { area: 'Dhanmondi', lat: 23.7461, lng: 90.3742, spots: ['Dhanmondi 27', 'Dhanmondi Lake', 'Dhanmondi Satmasjid Road'] },
  { area: 'Mirpur', lat: 23.8223, lng: 90.3654, spots: ['Mirpur 1', 'Mirpur 10', 'Mirpur 12', 'Mirpur Mirpur Stadium'] },
  { area: 'Uttara', lat: 23.8759, lng: 90.3795, spots: ['Uttara Sector 3', 'Uttara Sector 7', 'Uttara Airport Road'] },
  { area: 'Motijheel', lat: 23.7330, lng: 90.4172, spots: ['Motijheel C/A', 'Dilkusha', 'Motijheel Shapla Chattar'] },
  { area: 'Bashundhara', lat: 23.8223, lng: 90.4262, spots: ['Bashundhara City', 'Bashundhara R/A Gate', 'Bashundhara Convention'] },
  { area: 'Mohammadpur', lat: 23.7576, lng: 90.3589, spots: ['Mohammadpur Town Hall', 'Mohammadpur Bus Stand', 'Adabor'] },
  { area: 'Badda', lat: 23.7806, lng: 90.4265, spots: ['Badda Link Road', 'Badda Madhya', 'Rampura'] },
  { area: 'Khilgaon', lat: 23.7508, lng: 90.4264, spots: ['Khilgaon Flyover', 'Khilgaon Taltola'] },
  { area: 'New Market', lat: 23.7337, lng: 90.3855, spots: ['New Market', 'Nilkhet', 'Azimpur'] },
  { area: 'Farmgate', lat: 23.7573, lng: 90.3904, spots: ['Farmgate', 'Bijoy Sarani', 'Agargaon'] },
];

const CUSTOMER_NAMES = [
  'Arif Hossain', 'Nusrat Jahan', 'Rakib Ahmed', 'Sadia Islam', 'Tanvir Rahman',
  'Farhana Akter', 'Mehedi Hasan', 'Sumaiya Akter', 'Imran Khan', 'Jannatul Ferdous',
  'Shakib Al Hasan', 'Mim Akter', 'Rifat Chowdhury', 'Nafisa Tabassum', 'Hasan Mahmud',
];

const NOTES = [
  { key: 'thousand' as const, value: 1000 },
  { key: 'fiveHundred' as const, value: 500 },
  { key: 'twoHundred' as const, value: 200 },
  { key: 'oneHundred' as const, value: 100 },
  { key: 'fifty' as const, value: 50 },
];

const buildDenominations = (target: number) => {
  const counts = { thousand: 0, fiveHundred: 0, twoHundred: 0, oneHundred: 0, fifty: 0 };
  let remaining = target;
  for (const note of NOTES) {
    if (remaining <= 0) break;
    // occasionally skip a denomination to make stocks look natural
    const skip = Math.random() < 0.2 && note.value !== 50;
    if (skip) continue;
    counts[note.key] = Math.floor(remaining / note.value);
    remaining -= counts[note.key] * note.value;
    // keep a little randomness: give back a few notes
    if (counts[note.key] > 5 && Math.random() < 0.3) {
      const giveBack = rand(1, Math.min(5, counts[note.key]));
      counts[note.key] -= giveBack;
      remaining += giveBack * note.value;
    }
  }
  const cash = NOTES.reduce((sum, n) => sum + counts[n.key] * n.value, 0);
  return { counts, cash };
};

const seed = async () => {
  await connectDB();
  console.log('[seed] dropping stale collections/indexes...');
  const mongoose = (await import('mongoose')).default;
  const db = mongoose.connection.db;
  const names = ['users', 'atms', 'transactions', 'alerts', 'maintenances', 'settings'];
  for (const name of names) {
    try {
      await db?.dropCollection(name);
    } catch {
      // collection did not exist — ignore
    }
  }
  await Promise.all([
    User.syncIndexes(),
    Atm.syncIndexes(),
    Transaction.syncIndexes(),
    Alert.syncIndexes(),
    Maintenance.syncIndexes(),
    Settings.syncIndexes(),
  ]);

  console.log('[seed] creating users...');
  const users = await User.create([
    {
      name: 'System Administrator',
      email: env.seed.adminEmail,
      password: env.seed.adminPassword,
      role: 'admin',
      status: 'active',
      phone: '+8801700000001',
    },
    {
      name: 'Nusrat Jahan',
      email: 'manager@smartatm.com',
      password: 'manager123',
      role: 'manager',
      status: 'active',
      phone: '+8801700000002',
    },
    {
      name: 'Rakib Ahmed',
      email: 'operator@smartatm.com',
      password: 'operator123',
      role: 'operator',
      status: 'active',
      phone: '+8801700000003',
    },
  ]);
  console.log(`[seed] users: ${users.map((u) => u.email).join(', ')}`);

  console.log('[seed] creating 48 ATMs (44 online, 4 offline)...');
  const atmsData = [];
  let counter = 1;
  const offlineIndexes = new Set([7, 19, 31, 43]);
  for (let i = 0; i < 48; i += 1) {
    const areaInfo = AREAS[i % AREAS.length];
    const spot = areaInfo.spots[i % areaInfo.spots.length];
    const status: AtmStatus = offlineIndexes.has(i) ? 'offline' : 'online';

    const capacity = pick([1500000, 2000000, 2500000]);
    const ratio = status === 'offline'
      ? Math.random() * 0.5 + 0.2
      : pick([0.06, 0.15, 0.22, 0.45, 0.65, 0.8, 0.9]);
    const { counts, cash } = buildDenominations(Math.floor(capacity * ratio));

    atmsData.push({
      atmId: `ATM-DHK-${String(counter).padStart(3, '0')}`,
      name: `${spot} ATM`,
      area: areaInfo.area,
      location: {
        lat: Number((areaInfo.lat + (Math.random() - 0.5) * 0.02).toFixed(6)),
        lng: Number((areaInfo.lng + (Math.random() - 0.5) * 0.02).toFixed(6)),
        address: `${spot}, ${areaInfo.area}, Dhaka`,
      },
      status,
      cash,
      capacity,
      denominations: counts,
      lastRefill: new Date(Date.now() - rand(1, 14) * 24 * 60 * 60 * 1000),
      lastService: new Date(Date.now() - rand(1, 30) * 24 * 60 * 60 * 1000),
    });
    counter += 1;
  }
  const atms = await Atm.create(atmsData);
  const onlineAtms = atms.filter((a) => a.status === 'online');
  const offlineAtms = atms.filter((a) => a.status === 'offline');

  console.log('[seed] creating 7 days of transactions...');
  const typeWeights: Array<[TransactionType, number]> = [
    ['withdrawal', 0.6],
    ['deposit', 0.2],
    ['balance_inquiry', 0.15],
    ['transfer', 0.05],
  ];
  const pickType = (): TransactionType => {
    const r = Math.random();
    let acc = 0;
    for (const [type, weight] of typeWeights) {
      acc += weight;
      if (r <= acc) return type;
    }
    return 'withdrawal';
  };

  const transactions = [];
  const DAY = 24 * 60 * 60 * 1000;
  let refCounter = 1;
  for (let d = 6; d >= 0; d -= 1) {
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    dayStart.setTime(dayStart.getTime() - d * DAY);
    const perDay = rand(80, 160);
    for (let t = 0; t < perDay; t += 1) {
      const atm = pick(onlineAtms);
      const type = pickType();
      const amountBase =
        type === 'balance_inquiry'
          ? 0
          : Math.floor(rand(5, 40)) * 500;
      const fee = type === 'transfer' ? 15 : 0;
      const r = Math.random();
      const status = r < 0.92 ? 'success' : r < 0.97 ? 'failed' : 'pending';
      const createdAt = new Date(dayStart.getTime() + rand(0, DAY - 1));
      transactions.push({
        reference: `TXN${String(Date.now()).slice(-6)}${String(refCounter).padStart(5, '0')}`,
        atm: atm._id,
        atmCode: atm.atmId,
        type,
        amount: amountBase,
        fee,
        status,
        cardMasked: `**** **** **** ${rand(1000, 9999)}`,
        customerName: pick(CUSTOMER_NAMES),
        createdAt,
        updatedAt: createdAt,
      });
      refCounter += 1;
    }
  }
  await Transaction.insertMany(transactions);
  console.log(`[seed] transactions: ${transactions.length}`);

  console.log('[seed] creating alerts...');
  const alerts = [];
  for (const atm of atms) {
    const percentage = (atm.cash / atm.capacity) * 100;
    if (atm.status === 'offline') {
      alerts.push({
        type: 'offline',
        severity: 'critical' as AlertSeverity,
        status: 'active',
        title: 'ATM Offline',
        message: `${atm.atmId} at ${atm.area} is not responding since last poll.`,
        atm: atm._id,
        atmCode: atm.atmId,
      });
    }
    if (percentage <= 10) {
      alerts.push({
        type: percentage <= 3 ? 'cash_out' : 'cash_low',
        severity: (percentage <= 3 ? 'critical' : 'high') as AlertSeverity,
        status: 'active',
        title: percentage <= 3 ? 'Cash Almost Out' : 'Low Cash',
        message: `${atm.atmId} has ৳${atm.cash.toLocaleString()} remaining (${percentage.toFixed(0)}%).`,
        atm: atm._id,
        atmCode: atm.atmId,
      });
    } else if (percentage <= 25) {
      alerts.push({
        type: 'cash_low',
        severity: 'medium' as AlertSeverity,
        status: 'active',
        title: 'Cash Running Low',
        message: `${atm.atmId} cash level at ${percentage.toFixed(0)}%.`,
        atm: atm._id,
        atmCode: atm.atmId,
      });
    }
  }
  alerts.push({
    type: 'security',
    severity: 'high' as AlertSeverity,
    status: 'active',
    title: 'Unusual Withdrawal Pattern',
    message: 'Multiple high-value withdrawals detected from a single card.',
    atm: pick(onlineAtms)._id,
    atmCode: pick(onlineAtms).atmId,
  });
  alerts.push({
    type: 'network',
    severity: 'medium' as AlertSeverity,
    status: 'acknowledged',
    title: 'Network Latency',
    message: 'Elevated response time observed on the switch connection.',
    atm: pick(onlineAtms)._id,
    atmCode: pick(onlineAtms).atmId,
  });
  await Alert.insertMany(alerts);
  console.log(`[seed] alerts: ${alerts.length}`);

  console.log('[seed] scheduling maintenance...');
  const maintenance = [];
  for (const atm of offlineAtms) {
    maintenance.push({
      atm: atm._id,
      atmCode: atm.atmId,
      type: 'Hardware Repair',
      description: 'Dispenser module not responding. On-site inspection required.',
      technician: pick(['Engr. Kamal', 'Engr. Rafiq', 'Engr. Sabbir']),
      scheduledDate: new Date(Date.now() + rand(0, 2) * DAY),
      status: 'scheduled',
      cost: 0,
    });
  }
  maintenance.push({
    atm: pick(onlineAtms)._id,
    atmCode: pick(onlineAtms).atmId,
    type: 'Preventive Maintenance',
    description: 'Quarterly cleaning and calibration.',
    technician: 'Engr. Kamal',
    scheduledDate: new Date(Date.now() + 3 * DAY),
    status: 'scheduled',
    cost: 2500,
  });
  await Maintenance.insertMany(maintenance);
  console.log(`[seed] maintenance: ${maintenance.length}`);

  console.log('[seed] settings...');
  await Settings.create({});

  console.log('\n✅ Seed complete');
  console.log(`   Admin:    ${env.seed.adminEmail} / ${env.seed.adminPassword}`);
  console.log('   Manager:  manager@smartatm.com / manager123');
  console.log('   Operator: operator@smartatm.com / operator123');
  console.log(`   ATMs: ${atms.length} (online ${onlineAtms.length}, offline ${offlineAtms.length})`);

  await disconnectDB();
  process.exit(0);
};

seed().catch((err) => {
  console.error('[seed] failed', err);
  process.exit(1);
});
