"use client";

import { HomeCurriculumSection } from "@/components/home/HomeCurriculumSection";
import { HomeFaqSection } from "@/components/home/HomeFaqSection";
import { HomeGuidesSection } from "@/components/home/HomeGuidesSection";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomePricingSection } from "@/components/home/HomePricingSection";

type HomePageProps = {
  currentPlanSlug?: string | null;
  isAuthenticated?: boolean;
};

export default function HomePage({
  currentPlanSlug = null,
  isAuthenticated = false,
}: HomePageProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <HomeHeroSection
        currentPlanSlug={currentPlanSlug}
        isAuthenticated={isAuthenticated}
      />
      <HomeCurriculumSection />
      <HomeGuidesSection />
      <HomeFaqSection />
      <HomePricingSection currentPlanSlug={currentPlanSlug} />
    </main>
  );
}
