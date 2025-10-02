# Purge de gerações (privado >24h, público >4d)

Este pack entrega:
- `app/api/cron/purge/route.ts` — endpoint para o Vercel Cron / CI chamar.
- `supabase/patches/040_generations_purge.sql` — índices e uma função SQL opcional para limpeza pelo próprio banco.

## Endpoint `/api/cron/purge`

### Segurança
O endpoint exige o header **`X-CRON-SECRET`** igual a `process.env.CRON_SECRET`.
Defina as variáveis no projeto:
- `CRON_SECRET` — gere com `openssl rand -hex 32`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Comportamento
- Remove **privados** com `created_at < now() - 24h`
- Remove **públicos** com `public_at < now() - 4 days`
- Retorna JSON com `{ deleted_private, deleted_public, errors, cutoffs }`

### Configuração (Vercel)
- (Pro) Vercel → **Settings → Cron Jobs → Add**
  - Path: `/api/cron/purge`
  - Schedule: `0 * * * *` (de hora em hora) — planos Hobby permitem somente diário.
  - Method: `GET`
  - Header: `X-CRON-SECRET: <CRON_SECRET>`
- (Hobby) Use o **GitHub Actions** para chamar 1x/dia, ou cole manualmente no navegador com o header via curl/postman.

## SQL no banco
Rode `supabase/patches/040_generations_purge.sql` para criar índices e a função `purge_expired_generations()`.

- Execução manual:
```sql
select * from public.purge_expired_generations();
```
Retorna as contagens apagadas.

- (Opcional) Se **pg_cron** estiver habilitada no seu projeto Supabase, descomente o bloco `cron.schedule` no final do SQL
para rodar a cada hora **no banco**, sem depender do Vercel.

## Observações
- Este endpoint **não apaga arquivos do Storage**. Como cada projeto pode usar buckets distintos, podemos incluir uma limpeza de Storage depois (ex.: identificando URLs `storage/v1/object/...`), mas a remoção de arquivos exige uma política clara do bucket. Quando você definir os buckets das gerações, eu complemento.
