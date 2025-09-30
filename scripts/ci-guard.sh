#!/bin/bash
set -e

echo "🔎 Rodando guard de verificação..."

# Não permitir middleware de sessão
if grep -R "middleware" ./app | grep -q "supabase"; then
  echo "❌ ERRO: uso de middleware detectado."
  exit 1
fi

# Garantir que pacotes estão fixados
if grep -q '\^' package.json; then
  echo "❌ ERRO: dependências com caret (^) detectadas."
  exit 1
fi

echo "✅ Guard passou sem erros."