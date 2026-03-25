import type { Metadata } from "next";

import { GuideLandingPage } from "@/components/marketing/GuideLandingPage";
import { getPublicGuide } from "@/lib/public-guides";
import { createPageMetadata } from "@/lib/seo";

const guide = getPublicGuide("crypto-security-basics");

export const metadata: Metadata = createPageMetadata({
  title: "Crypto security basics",
  description:
    guide?.description ??
    "Learn crypto security basics with Blockwise.",
  pathname: "/crypto-security-basics",
  imagePath: "/crypto-security-basics/opengraph-image",
});

export default function CryptoSecurityBasicsPage() {
  if (!guide) {
    return null;
  }

  return <GuideLandingPage guide={guide} />;
}
