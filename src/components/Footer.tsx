"use client";

import Link from "next/link";
import Image from "next/image";
import { GRAIN_BG } from "@/components/GrainOverlay";
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
// ("Skogsnatt" #111110 per redesignets README, avsnitt 9 — mørkere enn
// HEADER_BG #111110 som brukes i selve navbaren) — footeren leser som bunnen
// av det samme trykte arket, ikke en separat, flat "footer-grå" bjelke.
// Struktur/lenker uendret, bare farger/font/logo oppdatert til redesignet.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative" style={{ background: "#111110" }}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: GRAIN_BG, opacity: 0.4 }}
      />
      <div
        className="relative mx-auto grid grid-cols-1 gap-10 py-16 sm:grid-cols-[1.3fr_1fr_auto] sm:gap-8 sm:py-20"
        style={{ maxWidth: "var(--content-max)", paddingInline: "var(--page-pad)" }}
      >
        {/* RAVN-logoen som en beskjeden signatur nederst. "Utforsk"-
            kolonnen er fjernet (ren duplisering av navbaren), og
            hjørnetikkene rundt logo+ingress er tatt bort. */}
        <div className="relative max-w-xs p-3">
          <Link href="/" className="inline-block transition-opacity active:opacity-70">
            <Image
              src="/ravn/ravn-logo.png"
              alt="RAVN"
              width={282}
              height={271}
              className="h-14 w-auto"
            />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-[#d9d2c1]">
            Et levende arkiv for kjerringråd og gode tips, delt fra kjøkken til kjøkken og
            stemt frem av de som har prøvd dem.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#6d685c" }}>
            Mer
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            <li>
              <Link href="/om-oss" className="text-sm text-[#d9d2c1] no-underline transition-colors visited:text-[#d9d2c1] hover:text-[#a93415]">
                Om oss
              </Link>
            </li>
            <li>
              <Link href="/del-rad" className="text-sm text-[#d9d2c1] no-underline transition-colors visited:text-[#d9d2c1] hover:text-[#a93415]">
                Del et råd
              </Link>
            </li>
            <li>
              <Link href="/mine-lagrede-rad" className="text-sm text-[#d9d2c1] no-underline transition-colors visited:text-[#d9d2c1] hover:text-[#a93415]">
                Mine lagrede råd
              </Link>
            </li>
            <li>
              {/* Midlertidig mailto — ingen ekte kontaktside/adresse ennå. */}
              <a href="mailto:kontakt@radbanken.no" className="text-sm text-[#d9d2c1] no-underline transition-colors visited:text-[#d9d2c1] hover:text-[#a93415]">
                Kontakt oss
              </a>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 sm:items-start sm:justify-end">
          {/* Midlertidige — ekte Instagram/Facebook-lenker kommer senere. */}
          <a href="#" aria-label="Instagram" className="text-[#cdc6b4] transition-colors hover:text-[#a93415]">
            <IconInstagram className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Facebook" className="text-[#cdc6b4] transition-colors hover:text-[#a93415]">
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
          <p>© {year} RAVN. Alle rettigheter reservert.</p>
          <p className="flex items-center gap-2">
            <IconSprig className="h-4 w-4 text-[rgba(225,214,194,0.6)]" />
            Samlet med omtanke.
          </p>
        </div>
      </div>
    </footer>
  );
}
