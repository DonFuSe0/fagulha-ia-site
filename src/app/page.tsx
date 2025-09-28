import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center space-y-8">
      <div className="mt-12">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-primary via-accent to-primary-700 bg-clip-text text-transparent">
          Libere sua Criatividade
        </h1>
        <p className="mt-4 text-muted max-w-2xl mx-auto">
          Gere imagens únicas usando inteligência artificial e uma interface simples e intuitiva.  Crie, explore e compartilhe sua galeria com o mundo.
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Link href="/generate" className="btn-primary">Gerar agora</Link>
          <Link href="/pricing" className="btn-secondary">Planos de tokens</Link>
        </div>
      </div>
      <div className="relative w-full max-w-4xl h-80 md:h-96 rounded-lg overflow-hidden shadow-lg">
        <Image
          src="/placeholder_light_gray_block.png"
          alt="Exemplo de geração"
          fill
          className="object-cover object-center"
        />
      </div>
    </div>
  );
}