import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'bloomcraft-dev-secret-change-in-production');
export const ADMIN_COOKIE_NAME = 'bloomcraft_admin_session';
export const CUSTOMER_COOKIE_NAME = 'bloomcraft_customer_session';
const TOKEN_EXPIRY = '7d';

export interface AdminPayload {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'FULFILMENT';
}

export interface CustomerPayload {
  id: string;
  email?: string;
  phone: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AdminPayload;
  customer?: CustomerPayload;
}

export async function createAdminToken(admin: AdminPayload): Promise<string> {
  return await new SignJWT({
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role,
    type: 'ADMIN',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function createCustomerToken(customer: CustomerPayload): Promise<string> {
  return await new SignJWT({
    id: customer.id,
    email: customer.email,
    phone: customer.phone,
    name: customer.name,
    type: 'CUSTOMER',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Admin authentication required' } });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'ADMIN') {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid admin token' } });
    }
    req.admin = {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as AdminPayload['role'],
    };
    next();
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Session expired or invalid' } });
  }
}

export async function verifyCustomerAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = req.cookies?.[CUSTOMER_COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Customer authentication required' } });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'CUSTOMER') {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid customer token' } });
    }
    req.customer = {
      id: payload.id as string,
      email: payload.email as string | undefined,
      phone: payload.phone as string,
      name: payload.name as string,
    };
    next();
  } catch {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Session expired or invalid' } });
  }
}

export function requireRole(allowedRoles: AdminPayload['role'][]) {
  const hierarchy: Record<string, number> = { OWNER: 3, MANAGER: 2, FULFILMENT: 1 };
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Admin login required' } });
    }
    const currentLevel = hierarchy[req.admin.role] || 0;
    const minRequired = Math.min(...allowedRoles.map((r) => hierarchy[r] || 0));
    if (currentLevel < minRequired) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Insufficient administrative privileges' } });
    }
    next();
  };
}
