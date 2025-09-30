import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="relative isolate overflow-hidden rounded-lg bg-background shadow-lg">
      <Image
        src="/hero-bg.png"
        alt="Fundo abstrato em tons de laranja"
        fill
        className="object-cover opacity-40"
        sizes="100vw"
        priority
      />
      <div className="relative z-10 px-6 py-24 sm:px-12 md:px-16">
        <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Crie imagens incríveis com IA
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-7 text-gray-300">
          Tema escuro com detalhes em laranja. Faça login, explore a galeria pública e, em breve,
          gere suas próprias imagens.
        </p>
        <div className="mt-10 flex items-center gap-x-6">
          <Link
            href="/auth/signup"
            className="rounded bg-brand px-6 py-3 text-sm font-semibold text-black shadow hover:bg-brand-light"
          >
            Começar agora
          </Link>
          <Link href="/explore" className="text-sm font-semibold leading-6 text-gray-300 hover:text-white">
            Ver exemplos <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </section>
  );
}
