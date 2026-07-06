import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ExamOS",
  description: "Private exam preparation dashboard"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
