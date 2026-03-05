import crypto from 'crypto';

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

  const payload = timestamp ? `${timestamp}.${rawBody}` : rawBody;
  const expected = toHexHmac(secret, payload);
  return safeEqualHex(signature, expected);
}
