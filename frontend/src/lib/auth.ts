import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'bloomcraft-dev-secret-change-in-production');
const ADMIN_COOKIE_NAME = 'bloomcraft_admin_session';
const CUSTOMER_COOKIE_NAME = 'bloomcraft_customer_session';
const TOKEN_EXPIRY = '7d';

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'MANAGER' | 'FULFILMENT';
}

export interface CustomerSession {
  id: string;
  email?: string;
  phone: string;
  name: string;
}

// ------------------- ADMIN AUTH -------------------

export async function createSession(admin: AdminSession): Promise<string> {
  const token = await new SignJWT({
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

  return token;
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'ADMIN') return null;
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as AdminSession['role'],
    };
  } catch {
    return null;
  }
}

export async function getSessionFromRequest(request: NextRequest): Promise<AdminSession | null> {
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'ADMIN') return null;
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as AdminSession['role'],
    };
  } catch {
    return null;
  }
}

export function hasPermission(role: AdminSession['role'], requiredRole: AdminSession['role']): boolean {
  const hierarchy: Record<string, number> = {
    OWNER: 3,
    MANAGER: 2,
    FULFILMENT: 1,
  };
  return (hierarchy[role] || 0) >= (hierarchy[requiredRole] || 0);
}

// ------------------- CUSTOMER AUTH -------------------

export async function createCustomerSession(customer: CustomerSession): Promise<string> {
  const token = await new SignJWT({
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

  return token;
}

export async function setCustomerSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearCustomerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE_NAME);
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(CUSTOMER_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'CUSTOMER') return null;
    return {
      id: payload.id as string,
      email: payload.email as string | undefined,
      phone: payload.phone as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}

export async function getCustomerSessionFromRequest(request: NextRequest): Promise<CustomerSession | null> {
  const token = request.cookies.get(CUSTOMER_COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'CUSTOMER') return null;
    return {
      id: payload.id as string,
      email: payload.email as string | undefined,
      phone: payload.phone as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
