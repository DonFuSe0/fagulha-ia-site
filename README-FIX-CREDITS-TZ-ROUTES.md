# Pack — fuso horário + créditos no Dashboard + rotas /settings e /gallery

Inclui:
- `app/dashboard/page.tsx` — saldo via `rpc('current_user_credits')` e datas no fuso `America/Sao_Paulo` (formato `dd/mm/aaaa - HH:MM:SS`).
- `app/settings/page.tsx` — mantém as abas e aplica o mesmo formato BR com timezone na tabela de tokens; usa RPC para exibir saldo.
- `app/gallery/page.tsx` — rota da **galeria privada** do usuário.
- `app/components/gallery/GalleryCard.tsx` — card simples para a galeria.

Como aplicar:
1) Extraia o zip na raiz.
2) Deploy.
3) Verifique:
   - **Dashboard** mostra seu saldo de **27 tokens** (confere com `tokens`).
   - **Datas** do extrato batem com sua hora local (São Paulo).
   - **/settings** e **/gallery** abrem sem 404.
