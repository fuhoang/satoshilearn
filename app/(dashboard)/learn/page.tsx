import type { Metadata } from "next";

import { LearnOverview } from "@/components/learn/LearnOverview";
import { lessonConfig, moduleConfig, trackConfig } from "@/content/config";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Curriculum",
  description: "Browse the Blockwise Bitcoin curriculum, modules, and lesson roadmap.",
  pathname: "/learn",
  noIndex: true,
});

export default function LearnPage() {
  const currentTrack =
    trackConfig.find((track) => track.slug === "bitcoin") ?? trackConfig[0];

  return (
    <LearnOverview
      currentTrack={currentTrack}
      modules={moduleConfig}
      totalLessons={lessonConfig.length}
      tracks={trackConfig}
    />
  );
}
