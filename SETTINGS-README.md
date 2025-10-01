# Settings Pack (Perfil / Segurança / Tokens)

**Arquivos incluídos**:
- `app/settings/page.tsx` — tabs Perfil / Segurança / Tokens
- `app/api/profile/update/route.ts` — atualizar apelido (único, 3–20, A-z 0-9 _)
- `app/api/profile/avatar/route.ts` — upload para bucket `avatars` e update em `profiles.avatar_url`
- `app/api/profile/password/route.ts` — alterar senha via supabase.auth.updateUser

**Pré-requisitos**:
- Buckets e policies: `avatars` público (já coberto pelo seu SQL 022 corrigido).
- Índice único: `create unique index if not exists profiles_nickname_lower_unique on public.profiles (lower(nickname)) where nickname is not null;`
- RLS de update no `profiles`: permitir que `auth.uid()` atualize o próprio registro.

**Variáveis de ambiente**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Observações**:
- O upload usa o Service Role via fetch para o Storage e salva a URL pública em `profiles.avatar_url`.
- O handler de senha exige sessão válida. O Supabase não exige "senha atual" se a sessão estiver ativa.
