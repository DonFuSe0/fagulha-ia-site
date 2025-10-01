# UI Header + Galeria Pública + Logout + Reuse Params

## Arquivos
- `app/_components/icons.tsx` — ícones SVG.
- `app/_components/AppHeader.tsx` — header com avatar/nick e dropdown.
- `app/api/auth/logout/route.ts` — encerra sessão e redireciona para /auth/login.
- `app/explorar/page.tsx` — galeria pública (grid, só botão "reutilizar").
- `app/api/generations/params/route.ts` — devolve `params` da geração (público; privado só dono).

## Como usar o Header
Importe o componente no seu layout principal (ex.: `app/layout.tsx`):
```tsx
// app/layout.tsx (exemplo)
import './globals.css'
import AppHeader from './_components/AppHeader'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-black">
        <AppHeader />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

## Requisitos
- Avatares padrão em `public/avatars/fire-1.png ... fire-4.png`
- Tabela `generations` com colunas: `id, user_id, image_url, thumb_url, is_public, public_since, params, created_at, storage_path`
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Observação
- A galeria pública *não* exibe botão de download, apenas "reutilizar".
- O endpoint `params` aceita anônimo se a imagem for pública; para privadas exige o dono autenticado.
