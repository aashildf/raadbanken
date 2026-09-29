import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import { SiteHeader } from "@/components/SiteHeader";
import { GrainOverlay } from "@/components/GrainOverlay";
import "./globals.css";

// Overskrifter, kickere og alle-caps-labels sitewide — samme variabelnavn
// (--font-googlesans) som før Google Sans Flex ble byttet ut, så alt som
// allerede bruker .font-display/.font-serif-display plukker opp den nye
// fonten uten endringer andre steder. Utprøvd først bare på forsiden, nå
// satt som sidens faste par.
const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-googlesans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Brødtekst sitewide — samme variabelnavn (--font-jakarta) som før Plus
// Jakarta Sans.
const montserrat = Montserrat({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: "variable",
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
      className={`${cormorantGaramond.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <DisclaimerGate />
        <GrainOverlay />
      </body>
    </html>
  );
}
