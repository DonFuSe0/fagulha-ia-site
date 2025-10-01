# Segurança (importante)

- O arquivo `docs/env.vercel.md` do repositório parece conter **chaves reais** (URL/ANON/SERVICE_ROLE/JWT/Turnstile).
  Se o repo estiver público ou já tiver sido compartilhado, **rote as chaves agora**:
  - Supabase: regenere `anon` e `service_role` + `JWT secret`.
  - Cloudflare Turnstile: regenere `site key` e `secret key`.
  - Atualize as variáveis nos ambientes (Vercel/produção) e **remova o arquivo com segredos** do histórico do Git.
