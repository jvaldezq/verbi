import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Verbi Example",
  description: "AI-powered internationalization for Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}