import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'nodejs';

type Plan = 'basic' | 'pro';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    throw new Error('Stripe secret key is not configured.');
  }

  return new Stripe(key);
}

function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    process.env.VERCEL_URL?.replace(/^(?!https?:\/\/)/, 'https://') ||
    'https://salesreport-ai.com'
  );
}

function getPriceId(plan: Plan) {
  const priceId =
    plan === 'basic'
      ? process.env.STRIPE_PRICE_BASIC_MONTHLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY;

  if (!priceId) {
    throw new Error(`Stripe price is not configured for plan: ${plan}`);
  }

  return priceId;
}

function isPlan(value: unknown): value is Plan {
  return value === 'basic' || value === 'pro';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const plan = body?.plan;

    if (!email || !isPlan(plan)) {
      return NextResponse.json({ error: 'Invalid checkout payload' }, { status: 400 });
    }

    const stripe = getStripe();
    const siteUrl = getSiteUrl();
    const priceId = getPriceId(plan);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      success_url: `${siteUrl}/register/complete?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/register`,
      metadata: {
        plan,
        email,
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
