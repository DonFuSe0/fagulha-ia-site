# Testes Pós-Deploy (passo a passo)

## A) Autenticação & Perfil
1. Acesse `/auth/login` e entre.
2. Vá para `/settings?tab=perfil`:
   - Altere o apelido (3–20, letras/números/underscore). Se duplicado, deve falhar.
   - Faça upload de avatar (PNG/JPG <= 2MB). Verifique se a imagem aparece no header e perfil.

## B) Segurança
1. `/settings?tab=seguranca`:
   - Troque a senha (>= 8 chars). Faça logout e tente logar com a nova senha.
   - Teste a exclusão de conta (apenas se desejar) digitando **EXCLUIR** — usuário some e um ban de 30 dias é criado.

## C) Galeria Privada
1. Gere/insira algumas imagens privadas (ou use as existentes na tabela).
2. Abra `/gallery`:
   - Veja grid com thumbs.
   - Clique em **tornar pública/privada** e verifique mudanças.
   - **Baixar** aparece **só** na privada e funciona por 24h (link assinado 60s).

## D) Galeria Pública
1. Abra `/explorar`:
   - Veja as públicas recentes (preview 1280).
   - Botão **Reutilizar** leva a `/generate?from=<id>` (params já disponíveis via `/api/generations/params`).

## E) Cron
1. No dashboard da Vercel, confirme o cron configurado.
2. Teste manual (opcional): `GET /api/cron/purge?secret=SEU_CRON_SECRET`
   - Deve retornar `{ ok: true, ... }`.
   - Se houver imagens antigas, elas são limpas conforme regras.

## F) Header/Menu
- Verifique o header (avatar alternando para fallback se faltar `avatar_url`).
- Dropdown com: Editar perfil / Comprar tokens / Galeria pública / Sair.
