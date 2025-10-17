import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import paymentRoutes from './routes/paymentRoutes.js';
import billRoutes from './routes/billRoutes.js';

// Construct and export an Express app without starting the server.
// This allows tests to import the app directly.
const app = express();

// Security headers
app.use(helmet());

// CORS: allow specific origins via CORS_ORIGIN (comma-separated); default permissive in dev/test
const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const corsOptions = allowed.length
  ? {
      origin: (origin, callback) => {
        // allow non-browser tools (no origin) and whitelisted origins
        if (!origin || allowed.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));

app.use(express.json());

// Basic rate limiting (skipped in tests)
if (process.env.NODE_ENV !== 'test') {
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
}

// Health route
app.get('/api/health', (req, res) => {
  res.status(200).send('OK');
});

// API routes
app.use('/api/payments', paymentRoutes);
app.use('/api/bills', billRoutes);

export default app;
