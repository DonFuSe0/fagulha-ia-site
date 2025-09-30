/* app/api/auth/signup/route.ts
   Server-side signup handler with:
     - Turnstile verification
     - disposable email denylist
     - rate limit 10 signups/day per IP
     - one signup per IP per 30 days (ip_hash)
     - creates user using Supabase Admin (service role)
     - records attempts and guards in DB
   Required env:
     - NEXT_PUBLIC_SUPABASE_URL
     - SUPABASE_SERVICE_ROLE_KEY
     - TURNSTILE_SECRET_KEY
     - SIGNUP_SALT
*/

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'crypto';
import disposable from '@/data/disposable_domains.json';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const SIGNUP_SALT = process.env.SIGNUP_SALT || 'change-me-replace';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Verify Cloudflare Turnstile token server-side
async function verifyTurnstile(token: string | undefined, remoteip?: string) {
  if (!TURNSTILE_SECRET_KEY) return false;
  if (!token) return false;
  const form = new URLSearchParams();
  form.append('secret', TURNSTILE_SECRET_KEY);
  form.append('response', token);
  if (remoteip) form.append('remoteip', remoteip);

  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form
  });
  const json = await res.json();
  return json.success === true;
}

// Extract IP from headers (Vercel uses x-forwarded-for)
function extractIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  // fallback
  return (req as any).ip || '0.0.0.0';
}

function hashIp(ip: string) {
  return createHmac('sha256', SIGNUP_SALT).update(ip).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, turnstileToken } = body;
    if (!email || !password) return NextResponse.json({ error: 'missing_fields' }, { status: 400 });

    const ip = extractIp(req);
    const ipHash = hashIp(ip);
    const domain = email.split('@').pop()?.toLowerCase() || '';

    // 1) Rate limit: attempts in last 24h
    const { count: attemptsCountRaw, error: cntErr } = await supabaseAdmin
      .from('signup_attempts')
      .select('id', { count: 'exact' })
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - 24*60*60*1000).toISOString());
    if (cntErr) console.warn('count err', cntErr);
    const attemptsCount = typeof attemptsCountRaw === 'number' ? attemptsCountRaw : 0;
    if (attemptsCount >= 10) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    // 2) Denylist check
    if (disposable.includes(domain)) {
      // record attempt
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      return NextResponse.json({ error: 'disposable_email' }, { status: 400 });
    }

    // 3) Turnstile
    const okTurn = await verifyTurnstile(turnstileToken, ip);
    if (!okTurn) {
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      return NextResponse.json({ error: 'turnstile_failed' }, { status: 400 });
    }

    // 4) 30-day guard check
    const { data: guards, error: guardErr } = await supabaseAdmin
      .from('signup_guards')
      .select('*')
      .eq('ip_hash', ipHash)
      .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString())
      .limit(1);
    if (guardErr) console.warn('guardErr', guardErr);
    if (guards && guards.length > 0) {
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      return NextResponse.json({ error: 'signup_window' }, { status: 403 });
    }

    // 5) create user via Supabase Admin
    const createRes = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });
    if (createRes.error) {
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      return NextResponse.json({ error: createRes.error.message }, { status: 400 });
    }

    const userId = createRes.user?.id;

    // record guard and attempt
    await supabaseAdmin.from('signup_guards').insert({
      user_id: userId,
      ip_hash: ipHash,
      email_domain: domain,
      user_agent: req.headers.get('user-agent')
    });
    await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });

    // Do NOT grant welcome credits here. grant_welcome_credits will be called by a DB trigger
    // when the user confirms their email (see SQL instructions).

    return NextResponse.json({ ok: true, userId }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
