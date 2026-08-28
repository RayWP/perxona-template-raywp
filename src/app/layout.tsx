import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Perxona Hackathon Template",
  description: "A generic Perxona Connect Kit and OpenAI-compatible starter.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
