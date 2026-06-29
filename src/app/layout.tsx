import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAYUL WORKROOM",
  description: "A personal creative operating system for designers and students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
