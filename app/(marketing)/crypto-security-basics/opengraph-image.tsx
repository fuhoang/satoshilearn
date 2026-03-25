import { renderGuideOpenGraphImage } from "@/components/marketing/GuideOpenGraphImage";
import { getPublicGuide } from "@/lib/public-guides";

export const alt = "Crypto security basics with Blockwise";
export { contentType, size } from "@/components/marketing/GuideOpenGraphImage";

export default function CryptoSecurityBasicsOpenGraphImage() {
  const guide = getPublicGuide("crypto-security-basics");

  if (!guide) {
    throw new Error("Guide not found");
  }

  return renderGuideOpenGraphImage(guide);
}
