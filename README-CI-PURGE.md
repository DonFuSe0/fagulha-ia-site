# Corrigindo o erro "Missing secrets PURGE_URL or CRON_SECRET"

Este workflow chama seu endpoint público `/api/cron/purge`. Para funcionar, crie **dois secrets** no GitHub:

- `PURGE_URL` → ex.: `https://SEU-SITE.vercel.app/api/cron/purge`
- `CRON_SECRET` → a mesma chave usada no Vercel/env; gere com: `openssl rand -hex 32`

Como criar: Repo → **Settings → Security → Secrets and variables → Actions → New repository secret**.

Se os secrets não existirem, o job **não falha** (fica *skipped*). Quando existirem, ele faz o GET com header `X-CRON-SECRET`.

> Dica: em contas Vercel Hobby, o cron da plataforma é limitado. Este agendamento roda no **GitHub Actions** (independe da Vercel).
