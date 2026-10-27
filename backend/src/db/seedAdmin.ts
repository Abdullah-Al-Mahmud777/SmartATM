import { Admin } from '../models/admin.model';
import { closeDatabase, connectToDatabase } from './connect';
import { getSettings } from '../models/settings.model';
import { env } from '../config/env';
import { hashPassword } from '../utils/security';

const SUPER_ADMIN_EMAIL = env.superAdminEmail;
const SUPER_ADMIN_PASSWORD = env.superAdminPassword;

interface SeedAdminInput {
  name: string;
  email: string;
  password: string;
  level: 'SUPER_ADMIN' | 'ADMIN';
}

async function upsertAdmin({ name, email, password, level }: SeedAdminInput): Promise<void> {
  const passwordHash = await hashPassword(password);
  const existing = await Admin.findOne({ email }).exec();

  if (!existing) {
    await Admin.create({
      name,
      email,
      passwordHash,
      level,
      status: 'active',
      failedLoginAttempts: 0,
      lockedUntil: null,
      passwordChangeRequired: false,
    });
    console.log(`[seed-admin] Admin created: ${email}`);
    return;
  }

  await Admin.findByIdAndUpdate(
    existing._id,
    {
      $set: {
        name,
        passwordHash,
        level,
        status: 'active',
        failedLoginAttempts: 0,
        lockedUntil: null,
        passwordChangeRequired: false,
      },
    },
    { new: true }
  );
  console.log(`[seed-admin] Admin credentials reset: ${email}`);
}

async function seed(): Promise<void> {
  await connectToDatabase();

  await upsertAdmin({
    name: 'Super Admin',
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    level: 'SUPER_ADMIN',
  });

  await upsertAdmin({
    name: 'Admin',
    email: 'admin@smartbank.local',
    password: 'Admin@1234',
    level: 'ADMIN',
  });

  const settings = await getSettings();
  console.log('[seed-admin] Default settings ready');
  console.log(`  - Transaction fee: ${settings.transactionFeePaisa} paisa`);
  console.log(`  - Withdraw cancel window: ${settings.withdrawCancelWindowSeconds} seconds`);
  console.log(`  - User auto logout: ${settings.userAutoLogoutMinutes} minutes`);
  console.log(`  - Approval threshold: ${settings.approvalThresholdPaisa} paisa`);
  console.log(`  - Maintenance mode: ${settings.maintenanceMode}`);

  await Admin.createIndexes();
}

seed()
  .then(async () => {
    await closeDatabase();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('[seed-admin] failed', error instanceof Error ? error.message : error);
    await closeDatabase();
    process.exit(1);
  });
