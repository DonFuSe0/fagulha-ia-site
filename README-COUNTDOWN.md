# Contador de expiração (24h) na galeria privada

Este patch adiciona um contador **ao vivo** nos cards da **galeria privada** informando
quanto tempo falta para o download expirar (24h após a criação).

Arquivos:
- `components/hooks/useCountdown.ts` — hook de contagem regressiva (1s).
- `components/gallery/GalleryCard.tsx` — overlay "Expira em Xh Ym" e bloqueio do botão após expirar.

Como aplicar:
1. Extraia os arquivos mantendo os caminhos.
2. Não há SQL necessário.
3. Faça build/deploy.

Observações:
- O endpoint `/api/generations/download-url` já valida a janela de 24h do lado do servidor.
  O contador é um **indicador visual** no cliente.
- Se quiser ajustar o visual, edite as classes do badge (`absolute left-2 top-2 ...`).
