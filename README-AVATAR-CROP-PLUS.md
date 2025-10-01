# Avatar Crop PLUS (pan + qualidade/formatos + resolução mínima)

O cropper agora tem:
- **PAN** (arrastar) + **Zoom** com limites (nunca mostra borda vazia);
- Saída configurável: **512/768/1024 px**, **JPEG (qualidade 60–100%) ou PNG**;
- Validação: a imagem de origem precisa ter o **menor lado ≥ tamanho de saída**.

Arquivos:
- `app/settings/AvatarCropper.tsx`
- `app/settings/UploadAvatarForm.tsx`

Como aplicar:
1) Extraia o zip mantendo os caminhos.
2) Deploy.
3) Em `/settings?tab=perfil`, selecione imagem → ajuste **zoom/pan** → escolha **formato/qualidade/tamanho** → **Confirmar** → upload com **progress ring**.

Requisitos:
- Já ter aplicado o pack que habilita `POST /api/profile/avatar?ajax=1` (JSON).
