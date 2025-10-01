# Cron em plano Hobby (Vercel) — solução

**Problema:** No plano **Hobby**, a Vercel permite apenas **cron diário**. A expressão `0 * * * *` (de hora em hora) requer **Pro**.
Você viu a mensagem: *"Hobby accounts are limited to daily cron jobs..."*

## Opção A — GitHub Actions (recomendado)
Use o workflow deste pacote: `.github/workflows/hourly-purge.yml`

### Como configurar
1. No GitHub do seu repo (`DonFuSe0/fagulha-ia-site`), vá em **Settings → Secrets and variables → Actions** e crie:
   - `PURGE_URL` → URL pública do seu endpoint de purge, ex.:  
     `https://SEU_DOMINIO/api/cron/purge`
   - `CRON_SECRET` → o **mesmo valor** que você definiu como env `CRON_SECRET` na Vercel.
2. Faça commit desse workflow (adicione o arquivo no repo) — ele roda **de hora em hora** no GitHub Actions (grátis).
3. Você também pode rodar manualmente em **Actions → Hourly Purge (Gallery) → Run workflow**.

> O endpoint já aceita `?secret=CRON_SECRET`, então não precisamos de headers especiais.

## Opção B — Cron diário pela Vercel (Hobby)
Se quiser manter algo pela Vercel, use o `vercel.json` deste pacote com execução **diária**:
- Agendado para `0 3 * * *` (03:00 UTC). Ajuste se quiser outro horário.

**Importante:** Evite manter **duas** fontes de cron ativas (Vercel + GitHub) ao mesmo tempo para não duplicar execução.

## Resumo do que fazer agora
- Escolha **A (Actions)** para limpar de hora em hora ou **B (Vercel)** para diário.
- Se usar **A**, remova qualquer cron do `vercel.json` ou da UI de Cron Jobs na Vercel.
- Se usar **B**, mantenha apenas o `vercel.json` diário.

---

# "Commit or Branch Reference" na Vercel

Se a Vercel pedir para colar uma referência, você pode:
- Colar o nome da branch de produção, ex.: `main`
- Ou criar um novo commit (pode ser vazio) e **push**:
  ```bash
  git commit --allow-empty -m "chore: trigger deploy"
  git push origin main
  ```
- Em último caso, clique em **Deployments → (seu último deploy) → Redeploy**.

---

# Checklist rápido
- **Project → Settings → Git**: repo `DonFuSe0/fagulha-ia-site`, **Automatic Deployments = Enabled**.
- **Root Directory** correto (se usa `app/` na raiz, deixe `./`).
- **Env**: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` na Vercel.
- `next build` e `npx tsc -noEmit` passam localmente.
