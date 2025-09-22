import Link from 'next/link';
export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-4">
      <h1 className="text-5xl font-bold text-purple-400">Fagulha.ia</h1>
      <p className="text-xl text-gray-300 mt-4">Sua faísca de criatividade, potencializada por IA.</p>
      <Link href="/login" className="mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
        Começar a Criar
      </Link>
    </main>
  );
}
