# Hotfix de cadastro (HTTP 500)

Este endpoint substitui o seu `/api/auth/signup` por uma versão **robusta** com `try/catch` e mensagens
claras. Ele lê **JSON ou form** e valida o bloqueio de 30 dias via `account_deletions` (por `email_hash`).

Inclui também `/api/dev/diag-signup` para checagens rápidas.

## Passos
1) Extraia o zip na raiz do projeto.
2) Deploy.
3) Teste:
   - **POST /api/auth/signup** com `email` e `password` (form ou JSON).
   - Em caso de erro, a resposta será JSON `{ ok:false, error }` (ou redirect no caso de form).
   - **GET /api/dev/diag-signup** → retorna JSON com flags de env e acesso às tabelas.

## Possíveis causas do 500 que isso resolve/expõe
- Exceções não capturadas no handler antigo (ex.: leitura de `body` inexistente, runtime edge sem Node APIs).
- Consulta ao `account_deletions` sem tabela/política → aqui respondemos erro claro ou flag no diag.
- Falta de variáveis de ambiente (ver `diag-signup`).

Se ainda falhar, me envie a resposta de `/api/dev/diag-signup` e o texto de `{ error }` retornado pelo signup.
