# Supabase Auth — Remetente como "Fagulha IA"

Você está recebendo e-mails como **"Supabase Auth <noreply@mail.app.supabase.io>"**. 
Para trocar o **nome do remetente** para **"Fagulha IA"**, faça:

1. Acesse **Supabase → Authentication → Email Templates**.
2. No canto superior direito, clique em **Settings** (ícone de engrenagem).
3. Em **Sender name** (ou **Email sender name**), preencha: **Fagulha IA**.
4. Salve.

> Observações
> - Usando o mailer padrão do Supabase (noreply@mail.app.supabase.io), você pode **customizar o *nome*** do remetente, mas **não** o domínio. Para usar seu próprio domínio (ex.: notificacoes@fagulha.ia.br), configure **SMTP próprio** em **Auth → SMTP Settings**.
> - Você já personalizou os **templates** (assunto/corpo) — isso permanece igual; estamos alterando apenas o **nome do remetente**.

## Alternativa (SMTP próprio)
Se quiser que o “From” fique, por exemplo, **"Fagulha IA <no-reply@fagulha.ia.br>"**:
1. **Configurar DNS** do seu domínio para o provedor de SMTP (SPF, DKIM, DMARC).
2. Em **Supabase → Authentication → SMTP Settings**, informe host/porta/usuário/senha e **sender** (ex.: `no-reply@fagulha.ia.br`) e **sender name**: `Fagulha IA`.
3. Salve e **faça um teste** nos templates (botão “Send test email”).

### Onde editar assunto e conteúdo
- **Supabase → Authentication → Email Templates**  
  Edite cada template (Confirm signup, Magic Link, etc.). O remetente herdará o **Sender name** acima.
