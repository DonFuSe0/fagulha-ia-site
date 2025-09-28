# Fagulha

Fagulha é uma plataforma SaaS para geração de imagens utilizando inteligência artificial.  Este repositório contém um esqueleto funcional baseado em Next.js 15, React 19, Tailwind CSS 4 e Supabase.  O objetivo é fornecer uma base sólida que pode ser implantada rapidamente na Vercel e integrada com uma instância do ComfyUI para processamento das imagens.

## Funcionalidades

* Autenticação de usuários via email/senha e Google (Supabase Auth).  A verificação de e‑mail em conjunto com o armazenamento do IP público já fornece uma boa proteção contra criação de múltiplas contas; opcionalmente, você pode integrar um reCAPTCHA simples no formulário de cadastro para reforçar ainda mais a segurança.
* Banco de dados PostgreSQL com políticas de acesso (RLS) que isolam dados por usuário.
* Sistema de tokens para gerar imagens, incluindo ledger e saldo.
* Geração de imagens via API interna (`/api/generate`) que desconta tokens e coloca o job em fila (você precisará integrar com sua instância ComfyUI).
* Webhook (`/api/webhooks/comfyui`) para atualizar o status das gerações quando o processamento terminar.
* Dashboard com saldo e últimas gerações, galeria privada, galeria pública e página de perfil.
* Página de preços com exemplos de pacotes de tokens (integração com Stripe opcional).

## Pré‑requisitos

* Node.js ≥ 18
* PNPM (ou npm/yarn) para instalar dependências
* Conta Supabase configurada com o schema fornecido em `fagulha_schema.sql`.
* Instância ComfyUI acessível via HTTP se desejar geração real de imagens.

## Configuração

1. Clone este repositório e entre na pasta `fagulha`.
2. Copie `.env.example` para `.env` e preencha os valores:

   * `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` encontram‑se nas configurações do seu projeto Supabase (project settings > API).
   * `SUPABASE_SERVICE_ROLE_KEY` é usado somente no servidor para executar RPCs protegidas.  **Nunca expõe este valor no cliente**.
   * `NEXT_PUBLIC_SITE_URL` deve apontar para o domínio onde sua aplicação estará hospedada (ex.: `https://app.fagulha.ai`).  É utilizado pelo Supabase para redirecionamentos de OAuth.
   * `COMFYUI_API_URL` e `COMFYUI_WEBHOOK_SECRET` devem ser configurados conforme a instância ComfyUI que irá gerar as imagens.
   * (Opcional) chaves Stripe para pagamentos de tokens.

3. No painel do Supabase, execute o SQL contido em `fagulha_schema.sql` no editor SQL para criar as tabelas, funções e políticas de segurança.  Certifique‑se de estar usando a role `postgres` ou um usuário com permissões adequadas.

4. Instale as dependências e inicie a aplicação em modo de desenvolvimento:

```bash
pnpm install
pnpm run dev
```

Acesse `http://localhost:3000` no navegador para visualizar a aplicação.

## Deploy

Recomenda‑se fazer o deploy na Vercel.  Crie um novo projeto e aponte para a pasta `fagulha`.  Adicione as variáveis de ambiente definidas em `.env`.  Na aba “Build & Output Settings” da Vercel, configure a build command `pnpm run build` e o output padrão do Next.js.

## Segurança contra múltiplas contas

A tabela `profiles` inclui campos `ip_address` e `device_id` para armazenar o IP público e um identificador de dispositivo.  Estes campos podem ser preenchidos na função `handle_new_user` passando valores no momento do cadastro (por exemplo via `X-Forwarded-For` e um token de device gerado no frontend).  Você pode utilizar estes dados para bloquear múltiplos cadastros a partir de um mesmo IP/dispositivo.  Além disso, a verificação de e‑mail já impede criações em massa sem endereços válidos.  Caso queira fortalecer ainda mais, é possível adicionar um reCAPTCHA no formulário de registro.

## Integração com ComfyUI

O endpoint `/api/generate` insere um registro na tabela `generations` com status `queued` e desconta os tokens necessários.  Após isso, você precisará enviar uma requisição HTTP para sua instância ComfyUI para iniciar o job.  Essa integração deve ser implementada no arquivo `src/app/api/generate/route.ts` (onde está marcado TODO).  Quando o processamento estiver completo, configure ComfyUI para chamar o webhook `POST /api/webhooks/comfyui` com os campos `id`, `status`, `image_url`, `thumb_url`, `duration_ms` e `error_message`.

As imagens geradas na galeria privada expiram em **24 horas**, enquanto as imagens tornadas públicas expiram em **48 horas**.  O campo `expires_at` da tabela `generations` controla esse tempo de vida; o endpoint `/api/generate` define a expiração inicial para 24 horas e, quando você publicar uma imagem, deverá atualizar `expires_at` para `now() + interval '48 hours'`.  O job `delete_expired_images` roda a cada 15 minutos para remover entradas e arquivos expirados.

## Contribuindo

Este projeto serve como base e ainda está em evolução.  Sinta‑se à vontade para adaptá‑lo às necessidades do seu produto, adicionar novas páginas, componentes e integrações.  Sugestões e pull requests são bem‑vindos!
