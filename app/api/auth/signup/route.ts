import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import disposableDomains from '@/data/disposable_domains.json';
import { getClientIp, hashIpHmac } from '@/lib/ip';

// Helpers ─────────────────────────────────────────────────────────────────────
function extractDomain(email: string) {
  return email.toLowerCase().split('@')[1] || '';
}

function isDisposable(domain: string) {
  return disposableDomains.includes(domain);
}

async function verifyTurnstile(token: string, ip?: string | null) {
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY || '',
        response: token,
        remoteip: ip ?? ''
      })
    });
    const json = await r.json();
    return !!json?.success;
  } catch {
    return false;
  }
}

// Route handler ───────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // Segurança: exige variáveis de ambiente obrigatórias
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const SIGNUP_SALT = process.env.SIGNUP_SALT;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SIGNUP_SALT) {
    return NextResponse.json(
      { error: 'Configuração do servidor incompleta (envs Ausentes).' },
      { status: 500 }
    );
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });

  try {
    const { email, password, turnstileToken } = await req.json();

    // Validações básicas de payload
    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
    }
    if (!turnstileToken) {
      return NextResponse.json({ error: 'Validação Turnstile ausente.' }, { status: 400 });
    }
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Formato inválido.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // IP + hash HMAC
    const ip = getClientIp(req);
    const ipHash = hashIpHmac(ip ?? 'unknown', SIGNUP_SALT);
    const domain = extractDomain(email);

    // Turnstile
    const turnstileOk = await verifyTurnstile(turnstileToken, ip);
    if (!turnstileOk) {
      // registra tentativa (falha Turnstile)
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      return NextResponse.json({ error: 'Falha na verificação do Turnstile.' }, { status: 400 });
    }

    // Deni-list de domínios descartáveis
    if (!domain || isDisposable(domain)) {
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      return NextResponse.json({ error: 'Domínio de e-mail não permitido.' }, { status: 400 });
    }

    // Rate limit: 10 cadastros/dia por IP
    {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from('signup_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since);

      if ((count || 0) >= 10) {
        return NextResponse.json(
          { error: 'Limite diário de cadastros a partir deste IP foi atingido. Tente amanhã.' },
          { status: 429 }
        );
      }
    }

    // Janela de 30 dias por IP
    {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabaseAdmin
        .from('signup_guards')
        .select('id', { count: 'exact', head: true })
        .eq('ip_hash', ipHash)
        .gte('created_at', since);

      if ((count || 0) > 0) {
        await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
        return NextResponse.json(
          { error: 'Uma conta já foi criada a partir deste IP nos últimos 30 dias.' },
          { status: 429 }
        );
      }
    }

    // Cria o usuário (SEM confirmar automaticamente)
    const { data, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    });
    if (createErr) {
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      // mensagens mais amigáveis se quiser mapear createErr.message
      return NextResponse.json({ error: createErr.message }, { status: 400 });
    }

    const userId = data?.user?.id;
    if (!userId) {
      await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });
      return NextResponse.json({ error: 'Falha ao criar usuário.' }, { status: 400 });
    }

    // Guarda relacionamento IP<->conta (30d)
    await supabaseAdmin.from('signup_guards').insert({
      user_id: userId,
      ip_hash: ipHash,
      email_domain: domain,
      user_agent: req.headers.get('user-agent') || null
    });

    // Registra tentativa bem-sucedida (conta criada)
    await supabaseAdmin.from('signup_attempts').insert({ ip_hash: ipHash, email_domain: domain });

    // Importante: o e-mail de confirmação é enviado automaticamente pelo Supabase
    // (desde que o template esteja habilitado). Os créditos de boas-vindas
    // serão concedidos pelo gatilho 'on_auth_user_confirmed' após a confirmação.

    return NextResponse.json({
      ok: true,
      message: 'Conta criada. Verifique seu e-mail para confirmar. Após confirmar, seus créditos serão liberados.'
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return NextResponse.json({ error: 'Erro interno ao processar o cadastro.' }, { status: 500 });
  }
}
