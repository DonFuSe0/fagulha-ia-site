import Hero from "@/components/hero";
import FeatureCards from "@/components/feature-cards";
import ExplorePreview from "@/components/explore-preview";
import CtaSection from "@/components/cta-section";

export default function HomePage() {
  return (
    <main className="relative">
      <Hero />
      <FeatureCards />
      <ExplorePreview />
      <CtaSection />
    </main>
  );
}
