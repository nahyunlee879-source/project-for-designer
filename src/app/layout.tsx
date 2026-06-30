import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NAYUL OS",
  description: "A private life operating system for goals, study, portfolio, career, money, and admin.",
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
