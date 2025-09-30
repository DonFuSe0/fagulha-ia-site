#!/bin/bash
set -euo pipefail

echo "🧪 Auditoria de repositório..."

# 1) next-env.d.ts existe?
if [ ! -f next-env.d.ts ]; then
  echo "❌ next-env.d.ts ausente"
  exit 1
fi

# 2) tsconfig tem baseUrl/paths?
if ! grep -q '"baseUrl"' tsconfig.json; then
  echo "❌ tsconfig.json sem baseUrl"
  exit 1
fi
if ! grep -q '"@/*"' tsconfig.json; then
  echo "❌ tsconfig.json sem paths '@/\*'"
  exit 1
fi

# 3) arquivo de denylist presente
if [ ! -f data/disposable_domains.json ]; then
  echo "❌ data/disposable_domains.json ausente"
  exit 1
fi

# 4) checa exports do lib/ip.ts
if ! grep -q 'export function getClientIp' lib/ip.ts; then
  echo "❌ lib/ip.ts não exporta getClientIp"
  exit 1
fi
if ! grep -q 'export function hashIpHmac' lib/ip.ts; then
  echo "❌ lib/ip.ts não exporta hashIpHmac"
  exit 1
fi

# 5) proíbe runtime edge e middleware de sessão
if grep -R "runtime:\s*'edge'" .; then
  echo "❌ uso de runtime edge detectado"
  exit 1
fi
if grep -R "middleware" ./app | grep -q "supabase"; then
  echo "❌ uso de middleware de sessão detectado"
  exit 1
fi

echo "✅ Auditoria passou."
