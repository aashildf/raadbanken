import type { Metadata } from "next";
import { Lora, Figtree, IBM_Plex_Mono, Alegreya, Source_Sans_3 } from "next/font/google";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import { SiteHeader } from "@/components/SiteHeader";
import { Footer } from "@/components/Footer";
import { GrainOverlay } from "@/components/GrainOverlay";
import "./globals.css";

// Redesign-pakkens fontsystem, nå sidens eneste: Montserrat og Cormorant
// Garamond er fjernet helt (se design/design_handoff_radbanken_forside).
// Lastes bare én gang hver — globals.css aliaser de gamle variabelnavnene
// (--font-googlesans/--font-jakarta, fortsatt brukt av .font-serif-display/
// .font-display) til disse, i stedet for å laste fontene dobbelt.
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Kun for ordleken RÅD i forsidens intro-seksjon (README: "Ordleken RÅD: IBM
// Plex Mono 400/500").
const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

// RAVN-seksjonene på forsiden (design_handoff_ravn_trinnvis, src/components/ravn):
// Alegreya (serif) + Source Sans 3 (sans). Brukes bare der, via .ravn i
// globals.css, så resten av siden beholder Lora/Figtree.
const alegreya = Alegreya({
  variable: "--font-alegreya",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "RAVN",
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
      className={`${lora.variable} ${figtree.variable} ${ibmPlexMono.variable} ${alegreya.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        {children}
        <Footer />
        <DisclaimerGate />
        <GrainOverlay />
      </body>
    </html>
  );
}
