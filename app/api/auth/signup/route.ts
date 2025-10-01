import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { supabaseRoute } from '@/lib/supabase/routeClient';
import { getClientIp, hashIpHmac } from '@/lib/ip';
import disposable from '@/data/disposable_domains.json';

const A1_TURNSTILE_ENABLED = true;
const A2_CONFIRM_EMAIL = true;
const A3_DENYLIST = true;
const B4_WINDOW_30D_BY_IP = true;
const B5_RATE_10_DAY_BY_IP = true;

function redirect(url: URL, params: Record<string,string>, status: number = 303) {
  const u = new URL(url);
  Object.entries(params).forEach(([k,v]) => u.searchParams.set(k, v));
  return NextResponse.redirect(u, status);
}

function pt(msg: string) { return msg; }

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

    const ip = getClientIp(req) || '0.0.0.0';
    const ipHash = hashIpHmac(ip);

    // B4: janela 30d por IP
    if (B4_WINDOW_30D_BY_IP) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=ip_hash&ip_hash=eq.${ipHash}&created_at=gte.${new Date(Date.now()-30*24*60*60*1000).toISOString()}`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return redirect(new URL('/auth/signup', url), { error: 'Não é possível criar mais de uma conta por IP no período de 30 dias.' });
        }
      }
    }

    // B5: rate 10/dia por IP
    if (B5_RATE_10_DAY_BY_IP) {
      const since = new Date(Date.now()-24*60*60*1000).toISOString();
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles?select=ip_hash&ip_hash=eq.${ipHash}&created_at=gte.${since}`, {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` }
      });
      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length >= 10) {
          return redirect(new URL('/auth/signup', url), { error: 'Limite diário de cadastros por IP atingido. Tente novamente mais tarde.' });
        }
      }
    }

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

    // Cria usuário (sem créditos iniciais; eles são dados após confirmação)
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

    // Salva ip_hash no profile após signUp (pode não existir user ainda sem confirmação — guardamos depois no callback/login, mas tentamos aqui se vier user)
    const userId = data.user?.id;
    if (userId) {
      await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/profiles`, {
        method: 'PATCH',
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          'content-type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ id: userId, ip_hash: ipHash }),
      }).catch(() => {});
    }

    return redirect(new URL('/auth/signup', url), { ok: 'Conta criada! Verifique seu e-mail para confirmar o cadastro.' });
  } catch (e: any) {
    return redirect(new URL('/auth/signup', url), { error: 'Erro interno ao processar o cadastro.' });
  }
}
