import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configura o cliente do Mercado Pago com sua chave de acesso
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! 
});

const plans = {
  cafezinho: { name: 'Cafezinho', tokens: 200, price: 9.99 },
  criador: { name: 'Criador', tokens: 700, price: 29.99 },
  profissional: { name: 'Profissional', tokens: 1500, price: 49.99 },
};

export async function POST(request: Request) {
  // 1. Valida o usuário
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
  }

  try {
    const { planId } = await request.json();
    const plan = plans[planId as keyof typeof plans];

    if (!plan) {
      return NextResponse.json({ error: 'Plano inválido' }, { status: 400 });
    }

    // 2. Cria a preferência de pagamento no Mercado Pago
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
          {
            id: planId,
            title: `Pacote de ${plan.tokens} tokens - Fagulha.ia`,
            quantity: 1,
            unit_price: plan.price,
            currency_id: 'BRL',
          },
        ],
        payer: {
          email: user.email,
        },
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_SITE_URL}/gallery?status=success`,
          failure: `${process.env.NEXT_PUBLIC_SITE_URL}/tokens?status=failure`,
          pending: `${process.env.NEXT_PUBLIC_SITE_URL}/tokens?status=pending`,
        },
        auto_return: 'approved',
        // 3. Define o webhook para receber notificações de pagamento
        notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payment-webhook`,
        // 4. Passa informações extras que receberemos de volta no webhook
        external_reference: user.id, // Usamos o ID do usuário como referência externa
        metadata: {
            user_id: user.id,
            plan_id: planId,
            tokens_to_add: plan.tokens
        }
      },
    });

    // 5. Retorna a URL de checkout para o frontend
    return NextResponse.json({ checkoutUrl: result.init_point });

  } catch (error) {
    console.error('Erro ao criar preferência de pagamento:', error);
    return NextResponse.json({ error: 'Falha ao comunicar com o Mercado Pago' }, { status: 500 });
  }
}
