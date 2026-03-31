"use client";

import { HomeCurriculumSection } from "@/components/home/HomeCurriculumSection";
import { HomeFaqSection } from "@/components/home/HomeFaqSection";
import { HomeGuidesSection } from "@/components/home/HomeGuidesSection";
import { HomeHeroSection } from "@/components/home/HomeHeroSection";
import { HomePricingSection } from "@/components/home/HomePricingSection";

type HomePageProps = {
  currentPlanSlug?: string | null;
};

export default function HomePage({ currentPlanSlug = null }: HomePageProps) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-white">
      <HomeHeroSection />
      <HomeCurriculumSection />
      <HomeGuidesSection />
      <HomeFaqSection />
      <HomePricingSection currentPlanSlug={currentPlanSlug} />
    </main>
  );
}
