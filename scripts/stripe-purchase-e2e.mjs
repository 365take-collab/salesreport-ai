#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue
    const [key, ...rest] = trimmed.split('=')
    if (!process.env[key]) {
      process.env[key] = rest.join('=').trim().replace(/^['"]|['"]$/g, '')
    }
  }
}

function envValue(...keys) {
  for (const key of keys) {
    const value = process.env[key]
    if (value && value.trim()) return value.trim()
  }
  return ''
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init)
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  return { response, data }
}

function buildWebhookHeaders(secret, rawBody) {
  if (!secret) return {}
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex')
  return {
    'x-utage-timestamp': timestamp,
    'x-utage-signature': signature,
  }
}

async function waitForUserRecord({ supabaseUrl, serviceRoleKey, email, expectedPlan, transactionId }) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    const query = new URL(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/salesreport_users`)
    query.searchParams.set('select', 'email,plan,status,transaction_id,product_name,amount')
    query.searchParams.set('email', `eq.${email}`)

    const { response, data } = await fetchJson(query.toString(), {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Supabase verify failed: HTTP ${response.status}`)
    }

    if (Array.isArray(data) && data.length > 0) {
      const row = data[0]
      if (row.plan === expectedPlan && row.status === 'active' && row.transaction_id === transactionId) {
        return row
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1500))
  }

  throw new Error('Timed out waiting for salesreport_users update')
}

async function main() {
  loadEnvFile(path.join(projectRoot, '.env.local'))
  loadEnvFile(path.join(projectRoot, '.env'))

  const baseUrl = (process.argv[2] || envValue('SALESREPORT_E2E_BASE_URL', 'NEXT_PUBLIC_BASE_URL') || 'https://salesreport.launchx.jp').replace(/\/$/, '')
  const supabaseUrl = envValue('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = envValue('SUPABASE_SERVICE_ROLE_KEY')
  const webhookSecret = envValue('UTAGE_WEBHOOK_SECRET')
  const plan = process.env.SALESREPORT_E2E_PLAN === 'pro' ? 'pro' : 'basic'
  const amount = plan === 'pro' ? 9800 : 980
  const productName = plan === 'pro' ? 'SalesReport AI Pro 月額' : 'SalesReport AI Basic 月額'
  const email = `stripe-e2e+${Date.now()}@launchx.jp`
  const transactionId = `txn_e2e_${Date.now()}`

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が必要です')
  }

  const checkoutUrl = `${baseUrl}/api/stripe/checkout`
  const { response: checkoutResponse, data: checkoutData } = await fetchJson(checkoutUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, plan }),
  })

  if (!checkoutResponse.ok || !checkoutData?.url) {
    throw new Error(`Checkout failed: HTTP ${checkoutResponse.status} ${JSON.stringify(checkoutData)}`)
  }

  const purchasePayload = JSON.stringify({
    email,
    name: 'Stripe E2E Tester',
    product_name: productName,
    amount,
    transaction_id: transactionId,
  })

  const { response: purchaseResponse, data: purchaseData } = await fetchJson(`${baseUrl}/api/webhook/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildWebhookHeaders(webhookSecret, purchasePayload),
    },
    body: purchasePayload,
  })

  if (!purchaseResponse.ok) {
    throw new Error(`Purchase webhook failed: HTTP ${purchaseResponse.status} ${JSON.stringify(purchaseData)}`)
  }

  const userRecord = await waitForUserRecord({
    supabaseUrl,
    serviceRoleKey,
    email,
    expectedPlan: plan,
    transactionId,
  })

  console.log(
    JSON.stringify(
      {
        ok: true,
        baseUrl,
        checkoutUrl,
        checkoutSessionUrl: checkoutData.url,
        purchaseWebhook: purchaseData,
        userRecord,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  )
  process.exit(1)
})
