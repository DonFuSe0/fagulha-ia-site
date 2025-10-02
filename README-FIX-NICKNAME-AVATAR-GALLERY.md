# Patch: nickname correto no header/perfil, avatar sem cache e galeria estável

- `app/settings/page.tsx`: nickname → `/api/profile/nickname` + toasts consistentes.
- `app/_components/AppHeader.tsx`: usa `profiles.nickname` e aplica `?v=timestamp` no avatar.
- `app/api/profile/avatar/route.ts`: salva `avatar_url` com `?v=<timestamp>`.
- `app/gallery/page.tsx`: evita erro 500/digest; se a consulta falhar, mostra aviso em vez de quebrar.
- `app/components/profile/ProfileCard.tsx`: render simples que prioriza nickname.

Depois do deploy:
- O **nickname** deve aparecer corretamente no header e no perfil.
- O **avatar** deve atualizar imediatamente após upload.
- A **galeria** deve abrir; se aparecer aviso vermelho, me envie o erro do banco (RLS/políticas).

Se o nickname ainda acusar “já existe” para qualquer nome, posso te mandar um SQL de verificação do índice `unique(lower(nickname))` e normalização.
