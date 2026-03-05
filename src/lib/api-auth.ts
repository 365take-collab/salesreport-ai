import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'salesreport_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;

type SessionPayload = {
  email: string;
  exp: number;
};

type SessionAuthResult =
  | { ok: true; email: string }
  | { ok: false; response: NextResponse };

function normalizeBase64(base64Url: string): string {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (base64.length % 4)) % 4;
  return base64 + '='.repeat(padding);
}

function toBase64Url(input: string | Buffer): string {
  const buffer = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function getSessionSecret(): string | null {
  return (
    process.env.SALESREPORT_SESSION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.OPENAI_API_KEY ||
    null
  );
}

function signPayload(encodedPayload: string, secret: string): string {
  return toBase64Url(
    crypto.createHmac('sha256', secret).update(encodedPayload).digest()
  );
}

function safeEqual(a: string, b: string): boolean {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function parsePayload(encodedPayload: string): SessionPayload | null {
  try {
    const decoded = Buffer.from(normalizeBase64(encodedPayload), 'base64').toString('utf8');
    const payload = JSON.parse(decoded) as Partial<SessionPayload>;
    if (typeof payload.email !== 'string' || typeof payload.exp !== 'number') {
      return null;
    }
    return {
      email: normalizeEmail(payload.email),
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

function parseSessionToken(token: string): SessionPayload | null {
  const secret = getSessionSecret();
  if (!secret) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload, secret);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  const payload = parsePayload(encodedPayload);
  if (!payload) {
    return null;
  }

  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildSessionCookie(email: string) {
  const normalizedEmail = normalizeEmail(email);
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('Session secret is not configured');
  }

  const payload: SessionPayload = {
    email: normalizedEmail,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);
  const value = `${encodedPayload}.${signature}`;

  return {
    name: SESSION_COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    },
  };
}

export function clearSessionCookie() {
  return {
    name: SESSION_COOKIE_NAME,
    value: '',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 0,
    },
  };
}

export async function getSessionEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const payload = parseSessionToken(token);
  if (!payload) {
    return null;
  }

  return payload.email;
}

export async function requireSessionEmail(): Promise<SessionAuthResult> {
  const email = await getSessionEmail();
  if (!email) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { ok: true, email };
}

export function ensureSessionEmailMatch(sessionEmail: string, requestedEmail: string | null | undefined): boolean {
  if (!requestedEmail) {
    return true;
  }

  return normalizeEmail(requestedEmail) === sessionEmail;
}

export function isInternalApiKeyValid(request: Request): boolean {
  const expected = process.env.SALESREPORT_INTERNAL_API_KEY;
  if (!expected) {
    return false;
  }

  const provided = request.headers.get('x-internal-api-key');
  if (!provided) {
    return false;
  }

  return safeEqual(provided, expected);
}

export function getAdminEmailAllowlist(): Set<string> {
  const raw = process.env.SALESREPORT_ADMIN_EMAILS;
  if (!raw) {
    return new Set<string>();
  }

  const emails = raw
    .split(',')
    .map((value) => normalizeEmail(value))
    .filter(Boolean);

  return new Set<string>(emails);
}
