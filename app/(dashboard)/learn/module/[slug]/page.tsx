import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ModuleOverview from "@/components/learn/ModuleOverview";
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

  return <ModuleOverview module={currentModule} />;
}
