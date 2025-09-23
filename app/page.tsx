import Link from 'next/link';

export default function HomePage() {
  return (
    <main>
      <section className="text-center py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white tracking-tight">
            Transforme Texto em Arte com o poder da <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Inteligência Artificial</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto">
            O Fagulha.ia é sua ferramenta para criar imagens incríveis e únicas a partir de simples descrições. Dê vida à sua imaginação, sem limites.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/dashboard" className="bg-primary text-white font-bold py-4 px-8 rounded-lg text-lg hover:bg-primary-hover transition-transform transform hover:scale-105">
              Começar a Criar
            </Link>
            <Link href="#features" className="bg-surface text-text-main font-bold py-4 px-8 rounded-lg text-lg border border-primary/20 hover:bg-primary/10 transition-colors">
              Saber Mais
            </Link>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white">Por que escolher o Fagulha.ia?</h2>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-surface p-6 rounded-lg border border-primary/10">
              <h3 className="text-2xl font-semibold text-primary">Interface Intuitiva</h3>
              <p className="mt-2 text-text-secondary">Crie sem complicações. Nossa interface foi desenhada para ser simples e direta, do prompt à imagem final.</p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-primary/10">
              <h3 className="text-2xl font-semibold text-primary">Preços Acessíveis</h3>
              <p className="mt-2 text-text-secondary">Com nosso sistema de tokens, você paga apenas pelo que usa. Planos flexíveis para todos os tipos de criadores.</p>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-primary/10">
              <h3 className="text-2xl font-semibold text-primary">Qualidade Superior</h3>
              <p className="mt-2 text-text-secondary">Utilizamos modelos de IA de ponta para garantir que suas criações tenham a máxima qualidade e fidelidade.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
