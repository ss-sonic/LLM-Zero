import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../styles/lesson-shell.css";
import "../styles/home.css";
import "../curriculum/01-character-representation/styles.css";

const title = "LLM Zero — Learn LLMs from First Principles";
const description =
  "A free, open-source, interactive curriculum for understanding large language models from the absolute basics — from bits and text representation to transformers, training, and inference.";

export const metadata: Metadata = {
  title: {
    default: title,
    template: "%s · LLM Zero",
  },
  description,
  applicationName: "LLM Zero",
  category: "education",
  keywords: [
    "LLM",
    "large language models",
    "AI education",
    "machine learning",
    "transformers",
    "first principles",
    "interactive learning",
    "open source education",
  ],
  creator: "LLM Zero contributors",
  publisher: "LLM Zero",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: "/icon.svg",
  },
  openGraph: {
    type: "website",
    title,
    description,
    siteName: "LLM Zero",
  },
  twitter: {
    card: "summary",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#141414",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
