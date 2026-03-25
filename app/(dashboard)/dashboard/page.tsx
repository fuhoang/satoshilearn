import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { lessonConfig, moduleConfig, trackConfig } from "@/content/config";
import { getProfileSummary } from "@/lib/profile";

export default async function DashboardPage() {
  const { label } = await getProfileSummary();
  const currentTrack =
    trackConfig.find((track) => track.slug === "bitcoin") ?? trackConfig[0];

  return (
    <DashboardOverview
      currentTrack={currentTrack}
      modules={moduleConfig}
      profileLabel={label}
      totalLessons={lessonConfig.length}
    />
  );
}
