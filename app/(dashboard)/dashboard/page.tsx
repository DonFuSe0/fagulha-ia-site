import GenerationArea from "@/components/GenerationArea"; // Caminho corrigido

export default function DashboardPage() {
  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">Área de Criação</h1>
        <p className="text-lg text-gray-400 mt-2">Dê vida às suas ideias. Descreva o que você imagina.</p>
      </div>
      <GenerationArea />
    </div>
  );
}
