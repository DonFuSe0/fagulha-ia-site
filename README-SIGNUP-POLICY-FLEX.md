# Signup policy flex

- `app/api/auth/signup/route.ts`: agora a senha mínima é configurável via **MIN_PASSWORD_LENGTH** (default 8).
- Erros padronizados: `missing_credentials`, `weak_password`, `signup_blocked_30d`, `email_already_registered`, `supabase_signup_error:*`.
- `app/auth/confirmar-email/page.tsx`: página simples pós-signup.

## Como usar
Defina no ambiente (opcional):
```
MIN_PASSWORD_LENGTH=8
```
Se quiser deixar com 6, defina `MIN_PASSWORD_LENGTH=6` (ou outro valor).

Teste com um password >= MIN_PASSWORD_LENGTH para o Supabase aceitar o cadastro.
