import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SchemeSetu — Find government benefits you may qualify for",
  description:
    "Discover Indian government welfare schemes you may be eligible for. Private, accessible, mobile-first. No accounts, no tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
