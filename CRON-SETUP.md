# Scheduled Functions (Vercel) — como configurar
### UI (Dashboard)
Project → Settings → **Functions** → **Cron Jobs** → Add
Path: /api/cron/purge
Schedule: 0 * * * *
Method: GET
Region: igual ao projeto
O runtime envia `x-vercel-cron: 1` automaticamente.
### vercel.json (alternativa)
{
  "crons": [ { "path": "/api/cron/purge", "schedule": "0 * * * *" } ]
}
### Env
CRON_SECRET (opcional para ?secret=)
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
