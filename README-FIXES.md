# Fixes: créditos via RPC, rotas 404 e logout 405

1) **SQL (Supabase)**
   - `supabase/patches/029_credits_rpc.sql` cria RPCs:
     - `current_user_credits()` → soma `tokens` do usuário da sessão;
     - `get_user_credits(uuid)` → soma por `user_id` (útil para server/admin).
   - São `security definer` e `stable` (performáticos e sem esbarrar em RLS).

2) **App**
   - `app/_components/AppHeader.tsx`:
     - Mostra créditos via `rpc('current_user_credits')` (fallback `profiles.credits`).
     - **Sair** agora é um **POST** para `/api/auth/logout` (nada de 405).
   - `app/api/auth/logout/route.ts`:
     - Implementa `POST` com `supabase.auth.signOut()` e redireciona ao `/auth/login`.
     - `GET` responde 405.
   - `app/settings/page.tsx`:
     - Garante a rota e exibe saldo via `current_user_credits()` na aba **Tokens**.
   - `app/gallery/page.tsx`:
     - Corrige import para `../components/gallery/GalleryCard` (evita 404/compilação).

**Como aplicar**
1) Execute o SQL `029_credits_rpc.sql` no Supabase.
2) Suba os arquivos do app.
3) Deploy.
4) Teste:
   - Header/Settings mostram o saldo correto.
   - Links para **/settings** e **/gallery** sem 404.
   - **Sair** funciona sem 405 e volta ao login.
