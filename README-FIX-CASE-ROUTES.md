# Fix de 404 e APIs não reconhecidas (case-sensitive)

Este patch cria **cópias minúsculas (.ts/.tsx)** dos arquivos que estavam com extensão maiúscula (.TS/.TSX),
o que impede o Next.js/Vercel (ambiente Linux, case-sensitive) de registrar as rotas e páginas.

Arquivos adicionados (com conteúdo idêntico):
- app/gallery/page.tsx
- app/settings/page.tsx
- app/api/profile/avatar/route.ts
- app/api/profile/password/route.ts
- app/api/profile/delete/route.ts
- app/api/profile/nickname/route.ts

⚠️ Importante (após aplicar):
1) **Remova os duplicados em maiúsculas** do repositório para evitar conflito:
   - app/gallery/page.TSX
   - app/settings/page.TSX
   - app/api/profile/avatar/route.TS
   - app/api/profile/password/route.TS
   - app/api/profile/delete/route.TS
   - app/api/profile/nickname/route.TS

2) Faça o **deploy** novamente.

3) Teste os caminhos:
   - /gallery (deixa de dar 404)
   - /settings?tab=perfil, /settings?tab=seguranca, /settings?tab=tokens (sem 404)
   - Enviar avatar, alterar senha, excluir conta e salvar apelido (APIs respondendo).

Motivo do bug
- O seu repositório tem arquivos com **extensões maiúsculas** (.TS/.TSX). Em dev no Windows/Mac pode funcionar, mas em produção (Linux) o filesystem diferencia maiúsculas/minúsculas e o Next não mapeia as rotas.

Boa prática
- Configure o Git para não alterar case ao renomear e crie um check no CI para bloquear arquivos com extensões fora do padrão.
