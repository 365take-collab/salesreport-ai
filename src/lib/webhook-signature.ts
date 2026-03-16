import crypto from 'crypto';

const MAX_TIMESTAMP_AGE_MS = 5 * 60 * 1000;

function toHexHmac(secret: string, payload: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  const normalizedA = a.trim().toLowerCase();
  const normalizedB = b.trim().toLowerCase();
  const aBuffer = Buffer.from(normalizedA, 'utf8');
  const bBuffer = Buffer.from(normalizedB, 'utf8');
  if (aBuffer.length !== bBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

export function verifyHmacSha256Signature(params: {
  rawBody: string;
  secret: string;
  signature: string;
  timestamp: string | null;
}): boolean {
  const { rawBody, secret, signature, timestamp } = params;
  if (!timestamp) {
    return false;
  }

  const parsedTimestamp = Number(timestamp);
  if (!Number.isFinite(parsedTimestamp)) {
    return false;
  }

  const timestampMs = parsedTimestamp > 1_000_000_000_000
    ? parsedTimestamp
    : parsedTimestamp * 1000;
  if (Math.abs(Date.now() - timestampMs) > MAX_TIMESTAMP_AGE_MS) {
    return false;
  }

  const payload = `${timestamp}.${rawBody}`;
  const expected = toHexHmac(secret, payload);
  return safeEqualHex(signature, expected);
}
