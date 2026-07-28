import type { Metadata } from "next";
import { Bricolage_Grotesque, Courier_Prime, Fraunces, Ibarra_Real_Nova, Inter, Kantumruy_Pro } from "next/font/google";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import { SiteHeader } from "@/components/SiteHeader";
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
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const courierPrime = Courier_Prime({
  variable: "--font-courier",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const kantumruy = Kantumruy_Pro({
  variable: "--font-kantumruy",
  subsets: ["latin"],
  weight: ["400"],
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
      className={`${bricolage.variable} ${courierPrime.variable} ${fraunces.variable} ${ibarra.variable} ${inter.variable} ${kantumruy.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <DisclaimerGate />
      </body>
    </html>
  );
}
