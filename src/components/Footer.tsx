"use client";

import Link from "next/link";
import Image from "next/image";
import { GRAIN_BG } from "@/components/GrainOverlay";
import { CornerFlourish } from "@/components/Button";
import { IconSprig } from "@/components/icons";

// Midlertidige sosiale ikoner — ekte Instagram/Facebook-URL-er kommer senere
// (se href="#" under), bare plassholdere inntil videre.
function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h2.5l.5-4H13V7a1 1 0 0 1 1-1h3Z" />
    </svg>
  );
}

// Samme papirkornete flate som navbaren (GRAIN_BG), bare enda mørkere
// ("Skogsnatt" #0c1b12 per redesignets README, avsnitt 9 — mørkere enn
// HEADER_BG #2E362C som brukes i selve navbaren) — footeren leser som bunnen
// av det samme trykte arket, ikke en separat, flat "footer-grå" bjelke.
// Struktur/lenker uendret, bare farger/font/logo oppdatert til redesignet.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative" style={{ background: "#0c1b12" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GRAIN_BG, opacity: 0.4 }}
      />
      <div
        className="relative mx-auto grid grid-cols-1 gap-10 py-16 sm:grid-cols-[1.3fr_1fr_auto] sm:gap-8 sm:py-20"
        style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
      >
        {/* Ordmerket — samme SVG som hero/"Del et råd" bruker (mørk-variant,
            for lys skrift på mørk bunn), 40px høy per README avsnitt 9 — en
            beskjeden signatur nederst, ikke heroens store oppslag.
            "Utforsk"-kolonnen (Kjerringråd/Lifehacks/Kultur/Planter og urter)
            er fjernet — ren duplisering av navbaren, som alltid er synlig.
            Hjørnetikker (samme CornerFlourish som knappene) oppe/nede rundt
            logo+ingress, etter ønske. className styrer kun strek-farge der —
            selve posisjoneringen (venstre/høyre, topp/bunn) ligger i
            komponenten. */}
        <div className="relative max-w-xs p-3">
          <CornerFlourish className="text-[#e1d6c2]" />
          <Link href="/" className="inline-block transition-opacity active:opacity-70">
            <Image
              src="/logo/radbanken-ordmerke-mork.svg"
              alt="Rådbanken"
              width={960}
              height={200}
              className="h-10 w-auto"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-[#e1d6c2]">
            Et levende arkiv for kjerringråd og gode tips, delt fra kjøkken til kjøkken og
            stemt frem av de som har prøvd dem.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#E1B08C" }}>
            Mer
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            <li>
              <Link href="/om-oss" className="text-sm text-[#e1d6c2] no-underline transition-colors visited:text-[#e1d6c2] hover:text-[#E1B08C]">
                Om oss
              </Link>
            </li>
            <li>
              <Link href="/del-rad" className="text-sm text-[#e1d6c2] no-underline transition-colors visited:text-[#e1d6c2] hover:text-[#E1B08C]">
                Del et råd
              </Link>
            </li>
            <li>
              <Link href="/mine-lagrede-rad" className="text-sm text-[#e1d6c2] no-underline transition-colors visited:text-[#e1d6c2] hover:text-[#E1B08C]">
                Mine lagrede råd
              </Link>
            </li>
            <li>
              {/* Midlertidig mailto — ingen ekte kontaktside/adresse ennå. */}
              <a href="mailto:kontakt@radbanken.no" className="text-sm text-[#e1d6c2] no-underline transition-colors visited:text-[#e1d6c2] hover:text-[#E1B08C]">
                Kontakt oss
              </a>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 sm:items-start sm:justify-end">
          {/* Midlertidige — ekte Instagram/Facebook-lenker kommer senere. */}
          <a href="#" aria-label="Instagram" className="text-[#e6dcc0] transition-colors hover:text-[#E1B08C]">
            <IconInstagram className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Facebook" className="text-[#e6dcc0] transition-colors hover:text-[#E1B08C]">
            <IconFacebook className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div
        className="relative border-t"
        style={{ borderColor: "rgba(225,214,194,0.18)" }}
      >
        <div
          className="mx-auto flex flex-col items-center gap-3 py-6 text-xs sm:flex-row sm:justify-between"
          style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)", color: "rgba(225,214,194,0.6)" }}
        >
          <p>© {year} Rådbanken. Alle rettigheter reservert.</p>
          <p className="flex items-center gap-2">
            <IconSprig className="h-4 w-4 text-[rgba(225,214,194,0.6)]" />
            Samlet med omtanke.
          </p>
        </div>
      </div>
    </footer>
  );
}
