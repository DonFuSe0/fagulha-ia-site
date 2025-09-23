import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com permissões de admin para ser usado no webhook
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Cliente do Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

export async function POST(request: Request) {
  const body = await request.json();

  // 1. O Mercado Pago envia uma notificação com o ID do pagamento
  if (body.type === 'payment') {
    const paymentId = body.data.id;
    console.log(`Webhook de pagamento recebido para o ID: ${paymentId}`);

    try {
      // 2. Usamos o ID para buscar os detalhes completos do pagamento na API do Mercado Pago
      const payment = await new Payment(client).get({ id: paymentId });

      if (payment && payment.status === 'approved') {
        const userId = payment.external_reference; // O ID do nosso usuário que passamos anteriormente
        const metadata = payment.metadata as { plan_id: string; tokens_to_add: number };
        
        if (!userId || !metadata) {
          throw new Error(`Pagamento ${paymentId} aprovado, mas sem external_reference ou metadata.`);
        }

        // 3. Evitar processamento duplicado: Verificamos se já processamos esta transação
        const { data: existingTransaction, error: checkError } = await supabaseAdmin
          .from('transactions')
          .select('id')
          .eq('payment_id', paymentId)
          .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = 'not found', o que é bom
          throw new Error(`Erro ao verificar transação existente: ${checkError.message}`);
        }
        
        if (existingTransaction) {
          console.log(`Transação ${paymentId} já foi processada. Ignorando.`);
          return NextResponse.json({ message: 'Transação já processada.' });
        }

        // 4. Adicionar os tokens ao perfil do usuário
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('token_balance')
          .eq('id', userId)
          .single();

        if (profileError) throw new Error(`Erro ao buscar perfil do usuário ${userId}: ${profileError.message}`);

        const newBalance = profile.token_balance + metadata.tokens_to_add;
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ token_balance: newBalance })
          .eq('id', userId);

        if (updateError) throw new Error(`Erro ao atualizar saldo do usuário ${userId}: ${updateError.message}`);

        // 5. Registrar a transação na nossa tabela 'transactions'
        const { error: transactionError } = await supabaseAdmin
          .from('transactions')
          .insert({
            user_id: userId,
            plan_id: metadata.plan_id,
            amount: payment.transaction_amount,
            tokens_added: metadata.tokens_to_add,
            payment_provider: 'mercadopago',
            payment_id: paymentId,
            status: 'approved',
          });

        if (transactionError) throw new Error(`Erro ao registrar transação: ${transactionError.message}`);

        console.log(`Sucesso! ${metadata.tokens_to_add} tokens adicionados ao usuário ${userId}.`);
      }
    } catch (error) {
      console.error('Erro ao processar webhook do Mercado Pago:', error);
      // Retornar status 200 mesmo em caso de erro para evitar que o Mercado Pago continue tentando
      return NextResponse.json({ error: 'Erro interno no processamento do webhook' }, { status: 200 });
    }
  }

  // Responde ao Mercado Pago que a notificação foi recebida com sucesso
  return NextResponse.json({ message: 'Webhook recebido.' });
}
