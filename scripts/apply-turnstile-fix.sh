#!/usr/bin/env bash
set -euo pipefail

echo "[1/3] Atualizando arquivos..."
cp -f app/layout.tsx ./app/layout.tsx
mkdir -p ./app/_components
cp -f app/_components/TurnstileExplicit.tsx ./app/_components/TurnstileExplicit.tsx
cp -f .env.sample ./.env.sample

echo "[2/3] Removendo widget implícito antigo (se existir)..."
if [ -f "./app/_components/Turnstile.tsx" ]; then
  git rm -f ./app/_components/Turnstile.tsx || rm -f ./app/_components/Turnstile.tsx || true
fi

echo "[3/3] Feito. Agora configure as variáveis na Vercel:"
echo "  - NEXT_PUBLIC_TURNSTILE_SITE_KEY"
echo "  - TURNSTILE_SECRET_KEY"
