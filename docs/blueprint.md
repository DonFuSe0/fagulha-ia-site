# Blueprint: Fagulha IA

Este documento descreve o objetivo e a estrutura do projeto **Fagulha IA**, um reboot
do zero 100% online. O intuito é fornecer uma base sólida para a construção de
um site baseado em **Next.js 14.2.5** integrado ao **Supabase** para autenticação
por e‑mail/senha. A entrega final deve ser um ZIP pronto para deploy na
Vercel.

## Objetivo

Criar um aplicativo web moderno com tema escuro e detalhes em laranja que
permita:

- Cadastro e login de usuários via e‑mail/senha.
- Painel protegido (`/dashboard`) para usuários autenticados.
- Página pública de exploração (`/explore`) e página placeholder de geração
  (`/generate`).
- Integração com Supabase para armazenar perfis, tokens, gerações de imagens e
  receber eventos de webhook.
- Sessão gerenciada pelo pacote `@supabase/auth-helpers-nextjs` sem uso de
  middleware de sessão.

## Estrutura de pastas esperada

```text
/
├─ app/
│  ├─ auth/
│  │  ├─ login/page.tsx
│  │  ├─ signup/page.tsx
│  │  ├─ callback/route.ts
│  │  └─ logout/route.ts
│  ├─ dashboard/page.tsx
│  ├─ generate/page.tsx
│  ├─ explore/page.tsx
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/Header.tsx
├─ lib/supabase/
│  ├─ serverClient.ts
│  ├─ routeClient.ts
│  └─ browserClient.ts
├─ supabase/schema.sql
├─ supabase/rpc.sql
├─ docs/
│  ├─ blueprint.md
│  ├─ env.vercel.md
│  └─ supabase-reset.sql
├─ scripts/ci-guard.sh
├─ .github/workflows/ci.yml
├─ app/globals.css
├─ package.json
├─ next.config.mjs
├─ tsconfig.json
├─ tailwind.config.ts
├─ postcss.config.js
└─ README.md
```

## Banco de dados (Supabase)

O arquivo `supabase/schema.sql` cria as tabelas `profiles`, `tokens`,
`generations` e `webhook_events`. Também define o gatilho `handle_new_user`
que cria um perfil e créditos iniciais para novos usuários e políticas de
segurança de nível de linha (RLS) para proteger os dados. O arquivo
`supabase/rpc.sql` define funções RPC `credit_tokens` e `spend_tokens` para
gerenciar o saldo de créditos. O script `docs/supabase-reset.sql` apaga e
recria todos os objetos da base, permitindo um reset rápido.

## Variáveis de ambiente

As variáveis sensíveis devem ser configuradas no painel da Vercel. O arquivo
`docs/env.vercel.md` contém todos os valores necessários (URL do banco,
chaves JWT, credenciais etc.). **Nunca inclua segredos em arquivos de código**.

## Scripts de CI

Há um script de guard (`scripts/ci-guard.sh`) que impede o uso de middleware de
sessão com Supabase e garante que as dependências estejam fixadas sem caret
(`^`). O workflow do GitHub (`.github/workflows/ci.yml`) executa esse script
automaticamente.

## Guia de desenvolvimento

1. Suba o repositório para o GitHub.
2. Conecte o repositório na Vercel.
3. Configure as variáveis de ambiente conforme `env.vercel.md`.
4. No Supabase SQL Editor, rode os scripts `supabase/schema.sql` e
   `supabase/rpc.sql`.
5. Na área Auth do Supabase, adicione como URL de redirecionamento
   `https://SEU-DOMINIO.vercel.app/auth/callback`.
6. Faça o deploy na Vercel e o site estará online.