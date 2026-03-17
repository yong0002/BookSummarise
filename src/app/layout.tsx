import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ChapterCut",
  description: "A simple site for turning book notes and excerpts into short summaries.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
