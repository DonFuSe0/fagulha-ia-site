import Image from 'next/image';
import Link from 'next/link';

/**
 * Página inicial do site. Apresenta um banner chamativo com um fundo
 * abstrato e um botão de call‑to‑action para incentivar o cadastro.
 */
export default function HomePage() {
  return (
    <section className="relative isolate overflow-hidden rounded-lg bg-background shadow-lg">
      {/* Fundo abstrato gerado programaticamente colocado em public/hero-bg.png */}
      <Image
        src="/hero-bg.png"
        alt="Fundo abstrato em tons de laranja"
        fill
        className="absolute inset-0 -z-10 object-cover opacity-70"
        priority
      />
      <div className="mx-auto max-w-3xl py-24 text-center">
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Desperte sua criatividade
        </h1>
        <p className="mx-auto mb-8 max-w-prose text-lg leading-relaxed text-gray-300">
          Explore a geração de imagens com inteligência artificial de forma fácil e rápida.
          Crie obras únicas e compartilhe com o mundo.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
          <Link
            href="/auth/signup"
            className="rounded bg-brand px-6 py-3 text-lg font-semibold text-black transition-colors hover:bg-brand-light"
          >
            Começar agora
          </Link>
          <Link
            href="/explore"
            className="text-lg font-semibold text-gray-300 transition-colors hover:text-white"
          >
            Explorar galeria
          </Link>
        </div>
      </div>
    </section>
  );
}