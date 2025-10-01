# Galeria — contador no PÚBLICO + seed de teste

Este pack faz duas coisas:
1) **Ativa o timer também no PÚBLICO** (4 dias a partir de `public_at`).
   - O badge “expira em …” aparece tanto em privados (24h) quanto em públicos (4d).
   - Download continua **apenas no privado** com tempo restante.

2) **Seed de teste** para popular a galeria privada com 1 imagem:
   - Inclui o arquivo `public/seed/fagulha-sample.jpg`.
   - Rota `GET/POST /api/dev/seed-generation` cria um registro em `generations`
     para o usuário autenticado apontando para essa imagem (privado).

Como aplicar
1) Extraia o zip na raiz do projeto.
2) Deploy.
3) Logado no site, acesse **/api/dev/seed-generation** (GET simples no navegador). Deve retornar `{ ok: true }`.
4) Vá em **/gallery** e confirme que:
   - A imagem seed aparece com **timer** (privado: “expira em …” de 24h).
   - Ao publicar com o ícone do olho, surge o **timer público** (4d).

Obs.: se o RLS bloquear INSERT em `generations`, garanta uma policy “owner can insert”,
ou me diga que eu te envio o SQL da policy compatível com seu schema.
