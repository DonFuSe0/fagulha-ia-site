import GenerationArea from "../GenerationArea"; // Importa o NOVO componente do diretório pai

export default function DashboardPage() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Área de Criação</h1>
        <p className="text-lg text-gray-400 mt-2">Dê vida às suas ideias. Descreva o que você imagina.</p>
      </div>

      {/* A importação agora usa um caminho relativo '../' para sair da pasta (dashboard) 
          e encontrar o componente na pasta /app. */}
      <GenerationArea />
    </div>
  );
}
