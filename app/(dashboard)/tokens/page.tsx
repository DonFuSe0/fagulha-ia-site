'use client';

import { useState } from 'react';

const plans = [
  { id: 'cafezinho', name: 'Cafezinho', tokens: 200, price: 9.99, description: 'Ideal para começar a experimentar.' },
  { id: 'criador', name: 'Criador', tokens: 700, price: 29.99, description: 'Perfeito para projetos pessoais.', popular: true },
  { id: 'profissional', name: 'Profissional', tokens: 1500, price: 49.99, description: 'Para usuários frequentes e projetos maiores.' },
];

export default function TokensPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    setIsLoading(planId);
    setError(null);

    try {
      const response = await fetch('/api/purchase-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao criar o link de pagamento.');
      }

      window.location.href = data.checkoutUrl;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
      setIsLoading(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-white">
          Recarregue seus <span className="text-primary">Tokens</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Escolha o plano ideal para dar vida às suas criações.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-surface rounded-2xl p-8 flex flex-col border-2 transition-all ${plan.popular ? 'border-primary shadow-2xl shadow-primary/20' : 'border-primary/20'}`}
          >
            {plan.popular && (
              <div className="text-center mb-4">
                <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">MAIS POPULAR</span>
              </div>
            )}
            <h2 className="text-3xl font-bold text-white text-center">{plan.name}</h2>
            <p className="text-5xl font-extrabold text-white text-center my-6">
              {plan.tokens} <span className="text-2xl font-medium text-text-secondary">tokens</span>
            </p>
            <p className="text-text-secondary text-center h-12">{plan.description}</p>
            <div className="mt-auto pt-6">
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={isLoading !== null}
                className="w-full py-4 font-bold text-white text-lg rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed bg-primary hover:bg-primary-hover"
              >
                {isLoading === plan.id ? 'Aguarde...' : `Comprar por R$ ${plan.price.toString().replace('.', ',')}`}
              </button>
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-red-400 text-center mt-8">{error}</p>}
    </main>
  );
}
