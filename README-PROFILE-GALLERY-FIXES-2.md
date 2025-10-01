# Patch: UI discreta no header, saldo de profiles.credits, datas pt-BR, excluir conta e /settings garantido

Inclui:
- `app/_components/AppHeader.tsx`: avatar + nick como botão com dropdown (Sair dentro do menu).
- `app/dashboard/page.tsx`: saldo vem de `profiles.credits` e datas em `dd/mm/yyyy - HH:MM:SS`.
- `app/settings/page.tsx`: restaurada/garantida rota; abas Perfil/Segurança/Tokens; form de excluir conta.
- `app/api/profile/delete/route.ts`: exclusão com ban 30 dias.

Passos:
1) Extraia o zip na raiz do projeto.
2) Garanta que os buckets/policies e a tabela `account_deletions` existem (patch 025).
3) Deploy e teste:
   - Dropdown discreto ao lado (avatar + nick).
   - `/settings?tab=seguranca` com formulário de exclusão.
   - Dashboard com saldo = profiles.credits e datas pt-BR.
