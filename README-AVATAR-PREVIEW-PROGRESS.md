# Avatar Preview + Progress

Este patch adiciona **pré-visualização** do avatar e **barra de progresso real** no upload.

Arquivos:
- `app/settings/UploadAvatarForm.tsx` — usa `XMLHttpRequest` para acompanhar progresso de envio (evento `upload.onprogress`), pré-visualização com `URL.createObjectURL`, valida tipo/tamanho e tem botão **Limpar**.
- `app/api/profile/avatar/route.ts` — suporta `?ajax=1` e retorna **JSON** em chamadas AJAX; mantém redirect para envios tradicionais.

Como usar:
1) Extraia o zip na raiz do projeto.
2) Deploy.
3) Em `/settings?tab=perfil`, escolha uma imagem e veja a prévia + barra de progresso. Ao finalizar, redireciona para a própria página com `toast=avatar_ok`.

Notas:
- O progresso mostrado é **do cliente → servidor**. Depois o servidor sobe para o Storage e atualiza o perfil.
- Mantida a segurança: o upload para o Storage continua **no servidor** com a Service Role (não expomos no cliente).
