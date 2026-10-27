import { Request } from 'express';

export interface RequestMeta {
  ip: string;
  userAgent: string;
  device: string;
  browser: string;
  location: string;
}

function detectDevice(userAgent: string): string {
  if (/iPad|Tablet/i.test(userAgent)) return 'Tablet';
  if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) return 'Mobile';
  return 'Desktop';
}

function detectBrowser(userAgent: string): string {
  if (/Edg\//i.test(userAgent)) return 'Microsoft Edge';
  if (/OPR\//i.test(userAgent)) return 'Opera';
  if (/Chrome\//i.test(userAgent)) return 'Chrome';
  if (/Firefox\//i.test(userAgent)) return 'Firefox';
  if (/Safari\//i.test(userAgent)) return 'Safari';
  return 'Unknown browser';
}

function normalizeIp(value: string | undefined): string {
  if (!value) return 'unknown';
  return value.replace(/^::ffff:/, '');
}

export function getRequestMeta(req: Request): RequestMeta {
  const userAgent = req.get('user-agent') ?? 'Unknown device';
  const city = req.get('x-vercel-ip-city') ?? req.get('cf-ipcity');
  const country = req.get('x-vercel-ip-country') ?? req.get('cf-ipcountry');
  const location = [city, country].filter(Boolean).join(', ') || 'Unknown location';

  return {
    ip: normalizeIp(req.ip ?? req.socket.remoteAddress),
    userAgent,
    device: detectDevice(userAgent),
    browser: detectBrowser(userAgent),
    location,
  };
}
