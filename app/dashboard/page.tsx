// import Header from '@/components/Header'; // Vamos adicionar o Header no próximo passo

export default function DashboardPage() {
  return (
    <div>
      {/* <Header /> */}
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-purple-400 mb-6">
            Área de Geração
          </h1>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <p>
              Bem-vindo ao Fagulha.ia! A área para gerar imagens, configurar prompts e escolher estilos aparecerá aqui.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
