import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import dbConnect from './config/db.js';

import authRoutes from './routes/auth.js';
import customerRoutes from './routes/customer.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import checkoutRoutes from './routes/checkout.js';
import orderRoutes from './routes/orders.js';
import customRequestRoutes from './routes/customRequests.js';
import settingsRoutes from './routes/settings.js';
import uploadRoutes from './routes/upload.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'BloomCraft Studio Backend API', timestamp: new Date() });
});

app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'BloomCraft Studio Backend API', version: '1.0.0', timestamp: new Date() });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/custom-order-requests', customRequestRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message || 'An unexpected error occurred',
    },
  });
});

async function startServer() {
  try {
    await dbConnect();
    console.log('🌸 Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`🌸 BloomCraft Studio Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database or start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;
