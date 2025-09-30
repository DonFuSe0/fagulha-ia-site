# Fagulha IA

Bem‑vindo ao **Fagulha IA**, uma aplicação web moderna construída com
**Next.js 14.2.5**, **TypeScript**, **Tailwind CSS** e **Supabase**. O objetivo
deste projeto é permitir que qualquer pessoa explore e gere imagens usando
inteligência artificial, com uma experiência de autenticação simples via
e‑mail e senha.

## 🎨 Visual

O site possui um tema escuro elegante com detalhes em laranja. A página
inicial apresenta um banner chamativo com fundo abstrato e botões de call‑to‑action
para criar uma conta ou explorar a galeria pública. Após fazer login, o
usuário tem acesso a um painel pessoal e uma página de geração (ainda em
construção).

## 🚀 Como rodar localmente

> **Pré‑requisitos:** Node.js 18+ e pnpm/yarn/npm.

```bash
# Instale as dependências
npm install

# Rode em modo de desenvolvimento
npm run dev

# Construa para produção
npm run build
```

## 📁 Estrutura principal

Veja `docs/blueprint.md` para uma visão detalhada da estrutura de pastas.

- `app/` – Rotas da aplicação usando o App Router do Next.js. Contém as páginas
  de autenticação, dashboard, geração, exploração e layout.
- `components/` – Componentes reutilizáveis como o cabeçalho (`Header`).
- `lib/supabase/` – Helpers para criar clientes Supabase no ambiente do
  navegador, servidor e em handlers de rota.
- `supabase/` – Scripts SQL para criar a estrutura de banco, funções RPC e
  políticas.
- `docs/` – Documentação, reset do banco e variáveis de ambiente.
- `scripts/ci-guard.sh` – Script que impede erros comuns no CI.

## 🛂 Autenticação com Supabase

O projeto utiliza `@supabase/auth-helpers-nextjs` para integrar a sessão de
usuário ao Next.js sem a necessidade de middleware de sessão. O cabeçalho
(`Header`) é um Server Component que obtém a sessão atual e mostra links
diferentes para usuários logados ou visitantes.

## 🔧 Reset do banco

Se precisar restaurar o estado da base Supabase, use o script
`docs/supabase-reset.sql`. Ele dropa tabelas, funções e gatilhos e recria a
estrutura completa. Recomenda‑se rodar esse script apenas em ambientes de
desenvolvimento.

## 📄 Licença

Este projeto é distribuído sob a licença MIT. Consulte o arquivo `LICENSE` se
inserir no repositório.