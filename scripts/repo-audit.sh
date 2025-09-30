#!/usr/bin/env bash
set -euo pipefail

fail() { echo "❌ $1"; exit 1; }
warn() { echo "⚠️  $1"; }
ok()   { echo "✅ $1"; }

echo "🔎 Deep Repo Audit — Next 14 + Supabase + Anti-abuso"

# 0) Básico
[ -f package.json ] || fail "package.json ausente"
grep -q '"next": "14.2.5"' package.json || fail "next 14.2.5 não encontrado em package.json"
grep -q '"react": "18.2.0"' package.json || fail "react 18.2.0 não encontrado"
grep -q '"react-dom": "18.2.0"' package.json || fail "react-dom 18.2.0 não encontrado"
grep -q '"@supabase/supabase-js": "2.43.5"' package.json || fail "@supabase/supabase-js 2.43.5 não encontrado"
grep -q '"@supabase/auth-helpers-nextjs": "0.10.0"' package.json || fail "auth-helpers 0.10.0 não encontrado"
grep -q '"tailwindcss": "3.4.10"' package.json || fail "tailwindcss 3.4.10 não encontrado"
grep -q '"postcss": "8.4.41"' package.json || fail "postcss 8.4.41 não encontrado"
grep -q '"autoprefixer": "10.4.20"' package.json || fail "autoprefixer 10.4.20 não encontrado"
grep -q '"typescript": "5.4.5"' package.json || fail "typescript 5.4.5 não encontrado"
grep -Eq '"\^' package.json && fail "Há dependências com caret (^) em package.json"
ok "Deps fixadas ok"

# 1) Estrutura essencial
need_paths=(
  "app/layout.tsx"
  "app/page.tsx"
  "app/auth/signup/page.tsx"
  "app/auth/login/page.tsx"
  "app/auth/callback/route.ts"
  "app/auth/logout/route.ts"
  "app/dashboard/page.tsx"
  "app/generate/page.tsx"
  "app/explore/page.tsx"
  "components/Header.tsx"
  "lib/supabase/serverClient.ts"
  "lib/supabase/routeClient.ts"
  "lib/supabase/browserClient.ts"
  "supabase/schema.sql"
  "supabase/rpc.sql"
  "docs/env.vercel.md"
  "docs/blueprint.md"
  "docs/supabase-reset.sql"
  "scripts/ci-guard.sh"
  ".github/workflows/ci.yml"
  "app/globals.css"
  "next.config.mjs"
  "tsconfig.json"
  "tailwind.config.ts"
  "postcss.config.js"
)
for p in "${need_paths[@]}"; do
  [ -f "$p" ] || fail "Arquivo obrigatório ausente: $p"
done
ok "Estrutura ok"

# 2) Proibições: middleware de sessão e Edge runtime
if [ -f "middleware.ts" ]; then
  ! grep -qi "supabase" middleware.ts || fail "middleware.ts menciona supabase — proibido"
  ! grep -q "export const runtime = 'edge'" middleware.ts || fail "middleware.ts usa Edge runtime — proibido"
fi
! grep -R "export const runtime = 'edge'" app | grep -v ".d.ts" >/dev/null 2>&1 || fail "Algum arquivo em app/ usa Edge runtime"
ok "Sem middleware de sessão/Edge"

# 3) Rota de signup com anti-abuso
[ -f "app/api/auth/signup/route.ts" ] || fail "Rota server signup ausente"
grep -q "challenges.cloudflare.com/turnstile" app/api/auth/signup/route.ts || fail "Turnstile server-side ausente no signup route"
grep -q "signup_attempts" app/api/auth/signup/route.ts || fail "signup route não usa signup_attempts"
grep -q "signup_guards" app/api/auth/signup/route.ts || fail "signup route não usa signup_guards"
grep -q "@supabase/supabase-js" app/api/auth/signup/route.ts || fail "signup route não usa supabase admin client"
ok "Signup route OK"

# 4) Denylist local
[ -f "data/disposable_domains.json" ] || fail "Denylist ausente"
ok "Denylist presente"

# 5) Turnstile no client (signup page)
grep -q "cf-turnstile" app/auth/signup/page.tsx || warn "Widget Turnstile não encontrado na signup page (ok se renderiza em outro comp.)"
grep -q "NEXT_PUBLIC_TURNSTILE_SITE_KEY" app/auth/signup/page.tsx || warn "Uso da env NEXT_PUBLIC_TURNSTILE_SITE_KEY não encontrado (verifique)"
ok "Turnstile client verificado (com avisos se houver)"

# 6) SQL: objetos-chave
grep -q "signup_attempts" supabase/schema.sql || fail "signup_attempts ausente no schema.sql"
grep -q "signup_guards" supabase/schema.sql || fail "signup_guards ausente no schema.sql"
grep -Eq "grant_welcome_credits|credit_tokens|spend_tokens" supabase/rpc.sql || fail "RPCs ausentes no rpc.sql"
grep -Eq "handle_new_user|on_auth_user_created" supabase/schema.sql || fail "gatilho de perfil ausente"
grep -Eq "handle_email_confirm|on_auth_user_confirmed" supabase/schema.sql || fail "gatilho de confirmação ausente"
ok "SQL parece completo"

# 7) Sanitização: procurar resquícios de '...'
! grep -R "^\.\.\.$" -n . >/dev/null 2>&1 || fail "Encontrado '...' em arquivo — possível truncamento de conteúdo"
! grep -R "[^a-zA-Z]\.\.\.[^a-zA-Z]" -n app components supabase >/dev/null 2>&1 || fail "Encontrado '...' embutido em arquivos principais"
ok "Sem truncamentos aparentes"

# 8) Bloqueio de OAuth Google (somente email/senha)
! grep -R "google" -n app lib >/dev/null 2>&1 || warn "Referência a 'google' encontrada (confira se não é OAuth)"
ok "OAuth Google não detectado (ou verifique aviso)"

echo "✅ Deep Repo Audit finalizado com sucesso."
