# CRON na Vercel + Geração do CRON_SECRET (hex 32)

## Gerar um segredo (hex de 32 bytes → 64 caracteres hex)

### macOS / Linux (OpenSSL)
```bash
openssl rand -hex 32
```

### Windows (PowerShell, sem OpenSSL)
```powershell
[byte[]]$b = New-Object byte[] 32; (New-Object System.Security.Cryptography.RNGCryptoServiceProvider).GetBytes($b); ($b | ForEach-Object ToString x2) -join ''
```

### Node.js (qualquer SO, com Node instalado)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Python (qualquer SO, com Python)
```bash
python - <<'PY'
import secrets; print(secrets.token_hex(32))
PY
```

Copie o valor gerado e guarde com segurança.

## Variáveis de ambiente (Vercel → Project → Settings → Environment Variables)
- `CRON_SECRET` → cole o valor gerado acima.
- `NEXT_PUBLIC_SUPABASE_URL` → URL do seu projeto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` → chave service role do Supabase.

(Depois de salvar, faça um redeploy para as envs entrarem em vigor.)

## Cron Job (Vercel → Project → Settings → Cron Jobs → Add)
- **Path**: `/api/cron/purge`
- **Schedule**: `0 * * * *`
- **Method**: `GET`
- **Region**: mesma do projeto
- **Headers**:
  - Key: `X-CRON-SECRET`
  - Value: cole **o mesmo valor** de `CRON_SECRET` (a UI da Vercel não referencia env automaticamente aqui; copie e cole o mesmo segredo).

## Teste manual
Faça um GET para `https://SEU_DOMINIO/api/cron/purge` enviando o header `X-CRON-SECRET: <seu segredo>`
→ deve responder `{ ok: true, ... }`.
