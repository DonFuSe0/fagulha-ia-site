# Turnstile Fix — Fagulha IA

Este pacote aplica a correção para o Cloudflare Turnstile:

1. **Modo explícito** no `app/layout.tsx` (script com `?render=explicit`).
2. **Componente explícito robusto**: `app/_components/TurnstileExplicit.tsx`.
3. **Atualização do `.env.sample`** com variáveis de Turnstile.
4. **(Opcional)** Remover o componente implícito antigo `app/_components/Turnstile.tsx`.

## Como aplicar

### Opção A — Substituir manualmente (recomendado)
- Copie os arquivos deste ZIP para o **raiz do seu projeto**, sobrescrevendo:
  - `app/layout.tsx`
  - `app/_components/TurnstileExplicit.tsx`
  - `.env.sample`
- **Delete** manualmente (ou via script) o arquivo antigo:
  - `app/_components/Turnstile.tsx`

### Opção B — Script (Linux/Mac)
Execute no raiz do projeto:
```bash
bash scripts/apply-turnstile-fix.sh
```

## Checklist após aplicar
- Configure na Vercel (ou no seu `.env.local`):
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
  - `TURNSTILE_SECRET_KEY`
- Garanta que os **hostnames** (domínios) usados por você estão permitidos no Turnstile.
- Rode o projeto e teste as páginas de **login** e **signup**.
