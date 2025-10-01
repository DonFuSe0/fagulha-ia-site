# Toasts + Loader (Upload de avatar)

- Toaster leve (sem dependências) em `app/_components/ui/Toasts.tsx`.
- `UploadAvatarForm` com **loader** no botão enquanto faz upload.
- Páginas/rotas passaram a redirecionar com `?toast=...`:
  - `perfil_ok`, `nick_dup`, `avatar_ok`, `avatar_fail`, `senha_ok`, `senha_fail`.
- `app/settings/page.tsx` consome `searchParams.toast` e aciona o toaster.

Como usar:
1) Extraia os arquivos mantendo a estrutura.
2) Deploy.
3) Teste os formulários em `/settings` e veja os toasts no topo direito.
