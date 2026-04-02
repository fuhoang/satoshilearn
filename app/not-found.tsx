import { FallbackPage } from "@/components/layout/FallbackPage";

export default function NotFound() {
  return (
    <FallbackPage
      description="The page you tried to open does not exist, may have moved, or is no longer part of the current learning path."
      eyebrow="404"
      fuzzyEyebrow
      title="This page is off the map."
    />
  );
}
