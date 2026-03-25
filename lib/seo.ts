import type { Metadata } from "next";

export function getSiteUrl() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL;

  if (!configured) {
    return "http://localhost:3000";
  }

  return configured.startsWith("http")
    ? configured.replace(/\/$/, "")
    : `https://${configured.replace(/\/$/, "")}`;
}

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, `${getSiteUrl()}/`).toString();
}

type PageMetadataOptions = {
  description: string;
  noIndex?: boolean;
  pathname: string;
  title: string;
};

export function createPageMetadata({
  description,
  noIndex = false,
  pathname,
  title,
}: PageMetadataOptions): Metadata {
  const canonical = absoluteUrl(pathname);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Blockwise",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
}
