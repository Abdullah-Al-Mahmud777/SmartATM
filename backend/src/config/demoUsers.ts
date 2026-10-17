import { User } from '../models/User';

// Default demo accounts used by the role login pages on the frontend.
// Keep these in sync with ROLE_LOGIN in frontend/components/auth/RoleLogin.tsx.
export const DEMO_USERS = [
  {
    name: 'System Administrator',
    email: 'admin@smartatm.com',
    password: 'admin123',
    role: 'admin',
    phone: '+8801700000001',
  },
  {
    name: 'Nusrat Jahan',
    email: 'manager@smartatm.com',
    password: 'manager123',
    role: 'manager',
    phone: '+8801700000002',
  },
  {
    name: 'Rakib Ahmed',
    email: 'operator@smartatm.com',
    password: 'operator123',
    role: 'operator',
    phone: '+8801700000003',
  },
] as const;

// Ensure the default accounts exist. Missing users are created (password gets
// hashed by the model pre-save hook); existing users are left untouched so real
// passwords are never reset. Cached so it runs at most once per process.
let ensured: Promise<void> | null = null;

export const ensureDemoUsers = (): Promise<void> => {
  if (!ensured) {
    ensured = (async () => {
      for (const demo of DEMO_USERS) {
        const exists = await User.exists({ email: demo.email });
        if (!exists) {
          await User.create({ ...demo, status: 'active' });
          // eslint-disable-next-line no-console
          console.log(`[bootstrap] created default ${demo.role} account: ${demo.email}`);
        }
      }
    })().catch((err) => {
      ensured = null;
      throw err;
    });
  }
  return ensured;
};
