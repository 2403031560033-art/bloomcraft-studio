import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Customer } from '../models/index.js';
import { createCustomerToken, CUSTOMER_COOKIE_NAME, ADMIN_COOKIE_NAME } from '../middleware/auth.js';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'bloomcraft-dev-secret-change-in-production');
const router = Router();

const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(phoneRegex, 'Please enter a valid 10-digit Indian phone number'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid registration details', details: parsed.error.issues },
      });
    }

    const { fullName, phone, email, password } = parsed.data;
    const existing = await Customer.findOne({
      $or: [{ phoneE164: phone }, ...(email ? [{ email: email.toLowerCase() }] : [])],
    });

    if (existing && existing.passwordHash) {
      return res.status(409).json({
        error: { code: 'CONFLICT', message: 'An account with this phone or email already exists. Please log in.' },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let customer;

    if (existing) {
      existing.fullName = fullName;
      if (email) existing.email = email.toLowerCase();
      existing.passwordHash = passwordHash;
      await existing.save();
      customer = existing;
    } else {
      customer = await Customer.create({
        fullName,
        phoneE164: phone,
        email: email ? email.toLowerCase() : undefined,
        passwordHash,
      });
    }

    const token = await createCustomerToken({
      id: customer._id.toString(),
      email: customer.email,
      phone: customer.phoneE164,
      name: customer.fullName,
    });

    res.cookie(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.status(201).json({
      success: true,
      data: {
        id: customer._id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phoneE164,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Phone/Email and password are required' },
      });
    }

    const customer = await Customer.findOne({
      $or: [
        { phoneE164: identifier },
        { email: identifier.toLowerCase() },
      ],
    });

    if (!customer || !customer.passwordHash) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid phone/email or password' },
      });
    }

    const isValid = await bcrypt.compare(password, customer.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Invalid phone/email or password' },
      });
    }

    const token = await createCustomerToken({
      id: customer._id.toString(),
      email: customer.email,
      phone: customer.phoneE164,
      name: customer.fullName,
    });

    res.cookie(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      success: true,
      data: {
        id: customer._id,
        name: customer.fullName,
        email: customer.email,
        phone: customer.phoneE164,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie(CUSTOMER_COOKIE_NAME);
  return res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', async (req: Request, res: Response) => {
  try {
    const customerToken = req.cookies?.[CUSTOMER_COOKIE_NAME];
    const adminToken = req.cookies?.[ADMIN_COOKIE_NAME];

    if (customerToken) {
      const { payload } = await jwtVerify(customerToken, JWT_SECRET);
      if (payload.type === 'CUSTOMER') {
        const customer = await Customer.findById(payload.id).select('-passwordHash');
        return res.json({
          success: true,
          type: 'CUSTOMER',
          data: {
            id: customer?._id || payload.id,
            name: customer?.fullName || payload.name,
            email: customer?.email || payload.email,
            phone: customer?.phoneE164 || payload.phone,
            addresses: customer?.addresses || [],
          },
        });
      }
    }

    if (adminToken) {
      const { payload } = await jwtVerify(adminToken, JWT_SECRET);
      if (payload.type === 'ADMIN') {
        return res.json({
          success: true,
          type: 'ADMIN',
          data: {
            id: payload.id,
            email: payload.email,
            name: payload.name,
            role: payload.role,
          },
        });
      }
    }

    return res.json({ success: false, data: null });
  } catch {
    return res.json({ success: false, data: null });
  }
});

export default router;
