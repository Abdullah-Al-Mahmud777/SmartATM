import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { isProd } from './config/env';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error';
import { apiLimiter } from './middleware/rateLimit';

const app: Application = express();

const corsOptions = {
  origin: ['https://smart-atm-three.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(isProd ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.json({
    success: true,
    data: { service: 'SmartATM Dashboard API', version: 'v1' },
    message: 'SmartATM API running',
  });
});

app.use('/api/v1', apiLimiter, routes);

app.use(notFound);
app.use(errorHandler);

export default app;
