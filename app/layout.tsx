import type { Metadata } from "next";
import { Google_Sans } from "next/font/google";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const googleSans = Google_Sans({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SatoshiLearn",
  description: "Structured Bitcoin learning with lessons, quizzes, and an AI tutor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${googleSans.className} min-h-full bg-black text-white`}>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
