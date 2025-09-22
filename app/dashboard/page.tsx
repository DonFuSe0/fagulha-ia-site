import Header from '@/components/Header'; // Agora vamos usar o Header

export default function DashboardPage() {
  return (
    <div>
      <Header />
      <main className="p-4 sm:p-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center my-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Dê vida à sua imaginação
            </h1>
            <p className="text-lg text-gray-400">
              Descreva o que você quer criar e deixe a mágica acontecer.
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[400px]">
            <p className="text-gray-400">
              A área para gerar imagens, com campo de prompt, seleção de estilos e modelos, aparecerá aqui.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
