import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100"),
  title: {
    default: "FFXIV Guide Engine",
    template: "%s | FFXIV Guide Engine"
  },
  description: "Guides, strategies, and progression tracking for Final Fantasy XIV."
};

export default function RootLayout(props: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
