# Fixes: saldo (credits), rotas 404 (/settings, /gallery) e URL pública do avatar

Incluído neste pacote:
1) **Sincronização automática de `profiles.credits`**
   - `supabase/patches/028_profile_credits_sync.sql` cria função + triggers em `tokens` para manter `profiles.credits` = soma de `tokens.amount`.
   - Executa um **backfill** inicial para corrigir saldos existentes.

2) **Rotas ausentes (404)**
   - `app/settings/page.tsx` — garante a página de configurações.
   - `app/gallery/page.tsx` — garante a página de **Minha galeria**.

3) **Avatar público com URL correta**
   - `app/api/profile/avatar/route.ts` corrigido para gerar a URL pública como:
     `/storage/v1/object/public/avatars/<user_id>/<user_id>.<ext>`

Como aplicar:
1) Suba os arquivos do zip.
2) No Supabase, rode o SQL `028_profile_credits_sync.sql`.
3) Faça o deploy.
4) Teste:
   - Dashboard/Settings devem exibir o **saldo correto** (agora persiste via trigger).
   - Links **Editar perfil / Alterar senha / Minha galeria** abrem sem 404.
   - Ao subir novo avatar, ele aparece (URL pública correta) no header e no perfil.
