import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bloquera",
    short_name: "Bloquera",
    description:
      "Structured crypto learning with lessons, quizzes, dashboard progress, and an AI tutor, starting with Bitcoin.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
  };
}
