import { CtaSection } from "../../components/organisms/CtaSection/CtaSection";
import { FeaturesSection } from "../../components/organisms/FeaturesSection/FeaturesSection";
import { HeroSection } from "../../components/organisms/HeroSection/HeroSection";
import { HowItWorksSection } from "../../components/organisms/HowItWorksSection/HowItWorksSection";
import { PopularPlaygroundsSection } from "../../components/organisms/PopularPlaygroundsSection/PopularPlaygroundsSection";
import { ReviewsSection } from "../../components/organisms/ReviewsSection/ReviewsSection";
import { usePlaygrounds } from "../../hooks/usePlaygrounds";

export function HomePage() {
  const { playgrounds, isLoading, error } = usePlaygrounds();

  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PopularPlaygroundsSection
        playgrounds={playgrounds}
        isLoading={isLoading}
        error={error}
      />
      <ReviewsSection />
      <CtaSection />
    </>
  );
}
