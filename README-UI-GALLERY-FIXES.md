# UI + Galeria — correções

- `app/_components/AppHeader.tsx` (server) agora delega o dropdown a `app/_components/UserMenu.tsx` (client). Isso evita
  problemas de hover e garante que o menu apareça em **clique/tap**.
- `app/gallery/page.tsx` mostra mensagens de erro vindas do Supabase em vez de quebrar o SSR.
- `app/api/dev/diag-gallery` ajuda a diagnosticar RLS/erros: retorna JSON simples com `rows`, `status` e `error`.
- `app/components/gallery/GalleryCard.tsx` incluído para garantir existência.

Teste rápido:
1) Deploy.
2) Acesse `/api/dev/diag-gallery` logado. Deve trazer `{ ok: true, rows: N }`. Se `401`, não está logado. Se `ok:false`, veja `error`.
3) Abra `/gallery`. Se aparecer mensagem, copie aqui para ajustarmos RLS/políticas.
