import type { Metadata } from "next";

import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { lessonConfig, moduleConfig, trackConfig } from "@/content/config";
import { getAccountStatusForCurrentUser } from "@/lib/account-status";
import { getProfileSummary } from "@/lib/profile";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description: "View your Blockwise dashboard, tutor analytics, lesson progress, and account summary.",
  pathname: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const [{ label }, accountStatus] = await Promise.all([
    getProfileSummary(),
    getAccountStatusForCurrentUser(),
  ]);
  const currentTrack =
    trackConfig.find((track) => track.slug === "bitcoin") ?? trackConfig[0];

  return (
    <DashboardOverview
      accountStatus={accountStatus}
      currentTrack={currentTrack}
      modules={moduleConfig}
      profileLabel={label}
      totalLessons={lessonConfig.length}
    />
  );
}
