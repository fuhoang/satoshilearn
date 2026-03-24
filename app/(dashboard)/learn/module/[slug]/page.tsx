import { notFound } from "next/navigation";

import ModuleOverview from "@/components/learn/ModuleOverview";
import { getModuleBySlug } from "@/lib/lessons";

export default async function LearnModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);

  if (!currentModule) {
    notFound();
  }

  return <ModuleOverview module={currentModule} />;
}
