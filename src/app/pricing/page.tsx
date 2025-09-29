export const dynamic = 'force-dynamic';

export default function Pricing() {
  const plans = [
    {
      // Plano básico com poucos tokens
      name: 'Faísca',
      tokens: 50,
      price: 'R$9,90'
    },
    {
      // Plano intermediário para criadores
      name: 'Chama Criativa',
      tokens: 200,
      price: 'R$29,90'
    },
    {
      // Plano avançado para usuários intensivos
      name: 'Labareda Pro',
      tokens: 500,
      price: 'R$59,90'
    }
  ];
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Planos de tokens</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div
            key={plan.name}
            className="bg-surface border border-border rounded-lg p-6 flex flex-col items-center text-center"
          >
            <h2 className="text-xl font-semibold mb-2">{plan.name}</h2>
            <p className="text-5xl font-extrabold text-primary mb-4">{plan.tokens}</p>
            <p className="text-muted mb-6">tokens</p>
            <p className="text-lg font-bold mb-6">{plan.price}</p>
            <button className="btn-primary w-full">Comprar</button>
          </div>
        ))}
      </div>
    </div>
  );
}
