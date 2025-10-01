# Galeria: contador + visibilidade + correções de rotas

Incluído:
1) **Contador** nas imagens privadas (expira em 24h desde `created_at`).
   - Botão **Download** só aparece no privado e enquanto houver tempo.
   - Público: **sem download** e **sem timer** (apenas botão de reutilizar).

2) **Visibilidade público/privado** (toggle com "olho"):
   - `POST /api/gallery/toggle` com `{ id, makePublic }`.
   - Quando torna **público**, marca `public_at = now()` (usado para expirar em 4 dias). Ao voltar ao privado, zera `public_at`.

3) **SQL** para coluna `public_at`:
   - `supabase/patches/030_generations_public_at.sql`

4) **Rotas**:
   - `app/gallery/page.tsx` agora busca `public_at` e injeta no card.
   - Redirects úteis (caso menu ou links apontem para aliases):
     - `/perfil` → `/settings?tab=perfil`
     - `/senha` → `/settings?tab=seguranca`
     - `/galeria` → `/gallery`

Aplicação:
1) Rode no Supabase: `030_generations_public_at.sql`.
2) Suba os arquivos do pack.
3) Deploy.
4) Teste:
   - Na **galeria privada**, cada card mostra `expira em …` e os botões **olho, download (se privado), reutilizar**.
   - Toggle público/privado funciona e atualiza (publicações terão `public_at`).
   - Os atalhos `/perfil`, `/senha`, `/galeria` não retornam 404 (redirecionam).

Observações:
- Para expurgo automático, mantenha o seu CRON apagando:
  - privados com `created_at < now() - interval '24 hours'`,
  - públicos com `public_at < now() - interval '4 days'`.
- Se sua policy RLS de `generations` bloquear `update`, habilite conforme o comentário no SQL.
