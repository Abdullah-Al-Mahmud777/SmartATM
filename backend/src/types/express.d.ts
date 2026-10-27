export interface AuthUser {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  tokenVersion: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  level: 'SUPER_ADMIN' | 'ADMIN';
  tokenVersion: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      admin?: AdminUser;
    }
  }
}
