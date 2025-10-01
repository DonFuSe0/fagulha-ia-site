# Avatar Crop + Compress + Progress Ring

Este pacote adiciona:
- **Recorte em círculo** com **zoom** central (simples) antes do upload.
- **Compressão**/padronização para **512×512 JPG** (qualidade ~0.9) no cliente.
- **Progress ring** (anel de progresso) durante o envio.

Arquivos:
- `app/settings/AvatarCropper.tsx` — canvas com máscara circular + slider de zoom; gera JPG 512.
- `app/settings/UploadAvatarForm.tsx` — integra o cropper e faz upload via XHR com **progress ring**.

Servidor:
- Não precisa mudar nada se você já aplicou o pack anterior (`avatar` com `?ajax=1`).
- O route handler já aceita multipart; o arquivo vai como `avatar.jpg`.

Como usar:
1) Extraia o zip mantendo os caminhos.
2) Deploy.
3) Vá em `/settings?tab=perfil`, selecione uma imagem → ajuste o **zoom** → confirme → veja o **progress ring** ao enviar.

Observação:
- Mantivemos a simplicidade: sem drag; foco em zoom central para garantir qualidade e UX rápida.
- Se quiser adicionar **pan/arrastar**, posso mandar uma versão estendida.
