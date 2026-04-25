import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "FFXIV Guide Engine Admin",
  description: "Operations console for jobs, sources, and guides."
};

export default function RootLayout(props: Readonly<{ children: ReactNode }>): ReactNode {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  );
}
