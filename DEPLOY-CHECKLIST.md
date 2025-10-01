# Deploy Checklist — Perfil & Galeria
Atualizado: 2025-10-01

## 1) Dependências
- Node 18+
- `npm i` (inclui `sharp`, `@supabase/auth-helpers-nextjs`, `@supabase/supabase-js`)

## 2) Variáveis de ambiente (Vercel → Project → Settings → Environment Variables)
- `NEXT_PUBLIC_SUPABASE_URL` — URL do seu projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` — Service Role **(NUNCA no client)**.
- `CRON_SECRET` (opcional; apenas para chamada manual `?secret=`).
- (opcional) `NEXT_PUBLIC_SITE_URL` — usado em redirecionamentos de auth (signup).

> Após salvar, faça **redeploy** para aplicar.

## 3) SQL aplicados
Confirme que os seguintes patches já foram aplicados:
- `020_generations_fields.sql` (params/paths/public_since/...)
- `022_storage_buckets_policies.sql` (buckets `avatars`, `gen-private`, `gen-public` + policies)
- `023_generations_indexes.sql`
- `024_rpc_private_overflow.sql`
- `025_account_deletions.sql` (ban 30 dias por e-mail)
- `026_profiles_nickname.sql` (coluna `nickname` + índice único lower(nickname))

## 4) RLS & Policies
- `public.profiles`: RLS **ON**, policies de **SELECT** e **UPDATE** pelo dono.
- `storage`:
  - `avatars`: **public read**, **owner write/update**.
  - `gen-private`: **owner read/write/update**.
  - `gen-public`: **public read**, **owner write**.

## 5) Arquivos estáticos
- Coloque os avatares padrão em `public/avatars/fire-1.png ... fire-4.png`.

## 6) Cron (Scheduled Function)
- UI: Project → Settings → **Functions** → **Cron Jobs** → Add
  - Path: `/api/cron/purge`
  - Schedule: `0 * * * *`
  - Method: `GET`
- **ou** `vercel.json` com a entrada `crons` (incluído neste pacote).
- O handler aceita o header `x-vercel-cron` (Vercel) ou `?secret=CRON_SECRET` para teste manual.

## 7) Build/CI
- `npx tsc -noEmit` → ✅
- `next build` → ✅

## 8) Observações
- Dashboard/Galeria usam **Server Components** (App Router) com `dynamic='force-dynamic'` e `revalidate=0`.
- Download é **apenas** na galeria privada (até **24h**).
- Público expira em **4 dias** via cron e não exibe download.
- Overflow privado >200 por usuário é limpo pelo cron.
