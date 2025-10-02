# Regras de Banimento (Cadastro)

Há dois mecanismos de proteção para evitar abuso de cadastros e “reset” de bônus:

## 1) Ban por E-mail (30 dias após exclusão de conta)

- Ao **excluir a conta**, é gravado um registro em `public.account_deletions` com:
  - `email_hash` (SHA-256 do e-mail em minúsculo)
  - `ban_until` = `now() + 30 dias`
- Na tentativa de cadastro:
  - Se existir um `account_deletions` para o `email_hash` com `ban_until > now()`, o cadastro é **bloqueado** (`signup_blocked_30d`).

**Exemplo**
- 02/out/2025 10:00 — Usuário `joao@exemplo.com` exclui a conta → `ban_until = 01/nov/2025 10:00`.
- 05/out/2025 — Tenta criar novamente com o mesmo e-mail → **bloqueado** até 01/nov/2025.
- 02/nov/2025 — Tenta criar novamente → **permitido** (e-mail liberado).

## 2) Ban por IP (30 dias a partir do cadastro)

- Ao **concluir um cadastro**, gravamos/atualizamos `public.signup_guards` com:
  - `ip_hash` (SHA-256 do IP visto no cabeçalho `X-Forwarded-For`/`X-Real-IP`)
  - `blocked_until` = `now() + 30 dias`
- Na tentativa de cadastro:
  - Se existir um `signup_guards` para `ip_hash` com `blocked_until > now()`, o cadastro é **bloqueado** (`too_many_signups_from_ip`).

**Exemplo**
- 02/out/2025 11:00 — IP `177.10.10.10` cria a conta → `blocked_until = 01/nov/2025 11:00`.
- 03/out/2025 — Qualquer novo cadastro a partir desse IP → **bloqueado** até 01/nov/2025.
- 02/nov/2025 — IP pode cadastrar novamente (se não houver outros bloqueios).

## Observações / Boas práticas
- **IP dinâmico / redes compartilhadas:** o ban por IP de 30 dias é forte. Em redes compartilhadas (coworking, residências com CGNAT) pode causar falsos positivos. Se necessário, implemente uma **whitelist de IPs** (tabela `ip_whitelist`) ou reduza o período.
- **Auditoria e suporte:** mantenha logs (webhook, tokens, `account_deletions`) para suportar análises de abuso/contestações.
- **Captcha:** recomendo manter o Cloudflare Turnstile no formulário de cadastro para elevar o custo de automação.
- **Privacidade:** salvamos apenas **hash do e-mail** (não o e-mail em texto) e **hash do IP** (não o IP em texto).

## Tabelas envolvidas
- `public.account_deletions (email_hash, ban_until, created_at ...)`
- `public.signup_guards (ip_hash, blocked_until, created_at ...)`
