import Hero from "@/components/hero";
import FeatureCards from "@/components/feature-cards";
import CtaSection from "@/components/cta-section";
// Se você já tem um gallery preview, pode importar aqui. Ou deixamos sem por enquanto.

export default function HomePage() {
  return (
    <main className="relative">
      <Hero />
      <FeatureCards />
      {/* Caso queira prévia da galeria: crie um componente leve e importe aqui */}
      <CtaSection />
    </main>
  );
}
