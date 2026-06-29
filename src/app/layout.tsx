import type { Metadata } from "next";
import { Bricolage_Grotesque, Fraunces, Ibarra_Real_Nova, Inter } from "next/font/google";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const ibarra = Ibarra_Real_Nova({
  variable: "--font-ibarra",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rådbanken",
  description: "Del og finn erfaringer med gamle husråd og hjemmeremedier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nb"
      className={`${bricolage.variable} ${fraunces.variable} ${ibarra.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <DisclaimerGate />
      </body>
    </html>
  );
}
