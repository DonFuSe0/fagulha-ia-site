import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';
import { getClientIp, hashIpHmac } from '@/lib/ip';
import disposable from '@/data/disposable_domains.json';

// Proteções habilitadas
const A1_TURNSTILE_ENABLED = true;
const A2_CONFIRM_EMAIL = true;
const A3_DENYLIST = true;
const B4_WINDOW_30D_BY_IP = true;
const B5_RATE_10_DAY_BY_IP = true;

function redirect(url: URL, params: Record<string, string>, status: number = 303) {
  const u = new URL(url);
  Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return NextResponse.redirect(u, status);
}

// REST com Service Role (bypassa RLS) — USO APENAS NO SERVIDOR
async function rest(servicePath: string, init?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const svc = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return fetch(`${base}${servicePath}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      apikey: svc,
      Authorization: `Bearer ${svc}`,
      'content-type': 'application/json',
    },
    cache: 'no-store',
  });
}

export async function POST(req: NextRequest) {
  const url = new URL(req.url);

  try {
    const form = await req.formData();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const password = String(form.get('password') ?? '');
    const cfToken = String(form.get('cf-turnstile-response') ?? '');

    if (!email || !password) {
      return redirect(new URL('/auth/signup', url), { error: 'Informe e-mail e senha.' });
    }

    // A3: denylist
    if (A3_DENYLIST) {
      const domain = email.split('@')[1] || '';
      if (disposable.includes(domain)) {
        return redirect(new URL('/auth/signup', url), { error: 'E-mail descartável não é permitido. Use outro endereço.' });
      }
    }

    // IP hashing
    const ip = getClientIp(req) || '0.0.0.0';
    const ipHash = hashIpHmac(ip);

    // A1: Turnstile
    if (A1_TURNSTILE_ENABLED) {
      if (!cfToken) {
        return redirect(new URL('/auth/signup', url), { error: 'Falha na verificação humana. Atualize a página e tente novamente.' });
      }
      const secret = process.env.TURNSTILE_SECRET_KEY || '';
      const ts = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret, response: cfToken }),
      }).then(r => r.json() as any);
      if (!ts.success) {
        return redirect(new URL('/auth/signup', url), { error: 'Verificação humana reprovada. Tente novamente.' });
      }
    }

    // 🔒 Checagens com Service Role na tabela signup_guard (antes do signUp)
    if (B4_WINDOW_30D_BY_IP) {
      const since30d = new Date(Date.now() - 30*24*60*60*1000).toISOString();
      const r = await rest(`/rest/v1/signup_guard?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since30d}`);
      if (!r.ok) throw new Error('Guard 30d falhou');
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length > 0) {
        return redirect(new URL('/auth/signup', url), { error: 'Não é possível criar mais de uma conta por IP no período de 30 dias.' });
      }
    }

    if (B5_RATE_10_DAY_BY_IP) {
      const since1d = new Date(Date.now() - 24*60*60*1000).toISOString();
      const r = await rest(`/rest/v1/signup_guard?select=id&ip_hash=eq.${ipHash}&created_at=gte.${since1d}`);
      if (!r.ok) throw new Error('Guard diário falhou');
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length >= 10) {
        return redirect(new URL('/auth/signup', url), { error: 'Limite diário de cadastros por IP atingido. Tente novamente mais tarde.' });
      }
    }

    // Reserva (TOCTOU-safe)
    await rest('/rest/v1/signup_guard', {
      method: 'POST',
      body: JSON.stringify({ ip_hash: ipHash }),
    });

    // Criação do usuário no Auth
    const supabase = supabaseRoute();
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: A2_CONFIRM_EMAIL ? { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` } : undefined,
    });

    if (error) {
      const m = (error.message || '').toLowerCase();
      if (m.includes('user_already_exists')) {
        return redirect(new URL('/auth/login', url), { error: 'Este e-mail já está cadastrado. Faça login.' });
      }
      return redirect(new URL('/auth/signup', url), { error: 'Não foi possível criar sua conta. Tente novamente.' });
    }

    const userId = data.user?.id;
    if (userId) {
      // Guarda ip_hash no profile
      await rest(`/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ ip_hash: ipHash }),
      });
    }

    return redirect(new URL('/auth/signup', url), { ok: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.' });
  } catch (e) {
    return redirect(new URL('/auth/signup', url), { error: 'Erro interno ao processar o cadastro.' });
  }
}
