import type { Metadata } from "next";
import "./globals.css";
import "./binary.css";

export const metadata: Metadata = {
  title: "LLM Zero — Learn LLMs from First Principles",
  description:
    "An open-source, interactive curriculum for understanding large language models from the absolute basics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
