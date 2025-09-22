import Header from '@/components/Header';
import GenerationArea from '@/components/GenerationArea'; // Importando nosso novo componente

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
          
          {/* Aqui está a grande mudança */}
          <GenerationArea />

        </div>
      </main>
    </div>
  );
}
