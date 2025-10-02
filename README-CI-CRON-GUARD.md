# CI/Cron — evitar falha por segredos ausentes

Seu Action estava falhando com:
```
Missing secrets PURGE_URL or CRON_SECRET
```

Este pack traz um snippet para o **ci.yml** que só executa o passo de purge **se os segredos existirem**.

## Como aplicar
1) Abra `.github/workflows/ci.yml` e substitua o step de purge pelo conteúdo de `ci-snippet.txt`.
2) Se quiser realmente usar o purge:
   - No GitHub, vá em **Settings → Secrets and variables → Actions** e crie:
     - `PURGE_URL` → ex: `https://<seu-dominio>/api/cron/purge`
     - `CRON_SECRET` → use um valor forte (ex: `openssl rand -hex 32`)
   - Garanta que a rota `/api/cron/purge` exista e valide `X-CRON-SECRET`.

Se os segredos não estiverem definidos, o step será **ignorado** e o CI não falhará.
