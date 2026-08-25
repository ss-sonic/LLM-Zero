import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LLM Zero — Learn LLMs from First Principles",
    short_name: "LLM Zero",
    description:
      "An open-source, interactive curriculum for understanding large language models from the absolute basics.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f1e8",
    theme_color: "#141414",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
