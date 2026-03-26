import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProFeatureGate } from "@/components/billing/ProFeatureGate";
import ModuleOverview from "@/components/learn/ModuleOverview";
import { hasProAccessForCurrentUser } from "@/lib/account-status";
import { getModuleBySlug } from "@/lib/lessons";
import { createPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const currentModule = getModuleBySlug(slug);

  if (!currentModule) {
    return createPageMetadata({
      title: "Curriculum module",
      description: "Blockwise Bitcoin curriculum module.",
      pathname: `/learn/module/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: currentModule.title,
    description: currentModule.description,
    pathname: `/learn/module/${slug}`,
    noIndex: true,
  });
}

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

  const hasProAccess = await hasProAccessForCurrentUser();

  if (currentModule.requiresPro && !hasProAccess) {
    return (
      <ProFeatureGate
        eyebrow="Pro module"
        source="locked_module_page"
        targetSlug={currentModule.slug}
        targetTitle={currentModule.title}
        title={`${currentModule.title} is part of Pro`}
        description="This module is reserved for Pro members. Upgrade to unlock advanced lessons, deeper tutor access, and the premium side of the curriculum."
      />
    );
  }

  return <ModuleOverview module={currentModule} />;
}
