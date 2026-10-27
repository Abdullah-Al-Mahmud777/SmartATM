declare module 'express-mongo-sanitize' {
  import { RequestHandler } from 'express';
  interface SanitizeOptions {
    replaceWith?: string;
    onSanitize?: (args: { req: unknown; key: string }) => void;
    dryRun?: boolean;
    allowDots?: boolean;
  }
  function sanitize(options?: SanitizeOptions): RequestHandler;
  export = sanitize;
}
