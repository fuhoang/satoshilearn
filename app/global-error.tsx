"use client";

import { useEffect } from "react";

import { FallbackPage, RetryAction } from "@/components/layout/FallbackPage";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-black text-white">
        <title>Something went wrong | Blockwise</title>
        <FallbackPage
          actions={<RetryAction onRetry={unstable_retry} />}
          description="Something unexpected interrupted this page. Try reloading this section, or head back to the curriculum and continue from there."
          details={error.digest ? `Reference: ${error.digest}` : undefined}
          eyebrow="Unexpected error"
          title="We hit a snag loading this page."
        />
      </body>
    </html>
  );
}
