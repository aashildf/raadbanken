"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useMenuEntries } from "@/lib/useMenuEntries";
import { HEADER_BG, HEADER_TEXT } from "@/lib/theme";
import { GRAIN_BG } from "@/components/GrainOverlay";
import { IconChevronDown, IconMenu, IconX } from "@/components/icons";

const SEEDS: { left: string; top: string; rotate: string }[] = [
  { left: "76%", top: "9%",  rotate: "22deg"  },
  { left: "60%", top: "4%",  rotate: "-20deg" },
  { left: "88%", top: "62%", rotate: "40deg"  },
];

// Denne menyen er mobil-only nå (se md:hidden-wrapperen rundt <SiteMenu>
// i SiteHeader) — desktop bruker hover-dropdownene på nav-lenkene i stedet
// (samme data, samme useMenuEntries-hook, se der for den to-kolonne
// mega-menyen som pleide å ligge her). Derfor er det bare den enkle
// accordion-listen igjen i dette panelet.
export function SiteMenu({ tone = "#3D2E3A" }: { tone?: string }) {
  const [open, setOpen]             = useState(false);
  const [visible, setVisible]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const menuEntries = useMenuEntries();

  function openMenu() {
    setOpen(true);
    setTimeout(() => setVisible(true), 12);
  }

  function closeMenu() {
    setVisible(false);
    setExpandedId(null);
    setTimeout(() => setOpen(false), 300);
  }

  const panel =
    open && mounted
      ? createPortal(
          <>
            {/* Backdrop — starter under headeren (ikke fra toppen av viewporten), slik at
                navbaren forblir synlig og klikkbar mens menyen er åpen, i stedet for å bli
                dekket av en mørk overlay. */}
            <div
              onClick={closeMenu}
              className={`menu-backdrop fixed inset-x-0 bottom-0 z-40 ${visible ? "is-visible" : ""}`}
              style={{
                top: "var(--header-height)",
                background: "rgba(20,10,35,0.22)",
                opacity: visible ? 1 : 0,
                pointerEvents: visible ? "auto" : "none",
              }}
            />

            {/* Panel — samme grunn: starter rett under headeren, ikke over den.
                Samme mørke bakgrunn + papirkorn som navbaren selv nå (ikke
                --page-bg lenger), så menyen føles som samme papirflate som
                slår ut, ikke et separat lyst popup-panel. */}
            <div
              className={`menu-panel fixed left-0 right-0 z-40 flex flex-col overflow-hidden ${visible ? "is-visible" : ""}`}
              style={{
                top: "var(--header-height)",
                maxHeight: "calc(88vh - var(--header-height))",
                background: HEADER_BG,
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
                boxShadow: "0 8px 40px rgba(20,14,10,0.35), 0 2px 6px rgba(20,14,10,0.18)",
                transform: visible ? "translateY(0) scale(1)" : "translateY(-105%) scale(0.98)",
              }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: GRAIN_BG, opacity: 0.4 }}
              />
              {/* Hovedinnhold — én kolonne. overflow-y-auto uansett skjermbredde: greit om
                  innholdet blir høyere enn panelet når en rad er åpen, det skal bare være
                  nåbart via scroll. Ingen egen lukkeknapp her lenger — hamburger-ikonet i
                  headeren morfer selv til et kryss når menyen er åpen (se trigger-knappen
                  nederst i filen). */}
              <div
                className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto pb-8 pt-6"
                style={{ paddingLeft: "max(28px, 6vw)", paddingRight: "max(48px, 7vw)", color: HEADER_TEXT }}
              >
                {/* Fem nav-punkter — bare "Kjerringråd" (kind: "dropdown") har en
                    klikk-accordion med de fem husråd-kategoriene under; resten
                    (Om oss/Lifehacks/Kultur/Planter og urter) er vanlige enkle
                    lenker, samme fordeling som hover-dropdownene i SiteHeader. */}
                <div>
                  {menuEntries.map((entry, i) => {
                    const isExpanded = expandedId === entry.id;
                    const hasCards = entry.kind === "dropdown";
                    return (
                      <div
                        key={entry.id}
                        className={i > 0 ? "border-t" : ""}
                        style={i > 0 ? { borderColor: "rgba(226,221,215,0.15)" } : undefined}
                      >
                        <div className="flex items-center">
                          {/* Navnet er en egen lenke til hele siden — pilen ved siden av er en
                              separat knapp som bare styrer utvidelsen, slik at man kan klikke
                              seg inn på f.eks. Kjerringråd direkte. */}
                          <Link
                            href={entry.href}
                            onClick={closeMenu}
                            className="flex flex-1 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/10 active:bg-white/15"
                          >
                            {hasCards && entry.cards[0] && (
                              <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                                <Image src={entry.cards[0].image} alt="" fill sizes="44px" className="object-cover" />
                              </span>
                            )}
                            <span className="text-base font-semibold sm:text-lg">{entry.name}</span>
                          </Link>
                          {hasCards && (
                            <button
                              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                              aria-label={isExpanded ? `Skjul underpunkter for ${entry.name}` : `Vis underpunkter for ${entry.name}`}
                              className="flex items-center self-stretch px-3 opacity-60 transition-opacity hover:opacity-90 active:opacity-100"
                            >
                              <IconChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </div>

                        {hasCards && (
                          <div className={`accordion-row ${isExpanded ? "is-expanded" : ""}`}>
                            <div className="flex flex-col pb-2 pl-[4.25rem] pr-3">
                              {entry.cards.map((card) => (
                                <Link
                                  key={card.key}
                                  href={card.href}
                                  onClick={closeMenu}
                                  className="py-1.5 text-sm transition-colors hover:text-[#E1B08C] active:opacity-60"
                                  style={{ color: "rgba(226,221,215,0.75)" }}
                                >
                                  {card.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Dandelion bg */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <Image
                  src="/logo/big_dandelion_bg.png"
                  alt=""
                  width={320}
                  height={320}
                  className="absolute right-[-4%] top-[-10%] select-none"
                  style={{ width: "38vw", maxWidth: 260, opacity: 0.15 }}
                  aria-hidden="true"
                />
                {SEEDS.map((s, i) => (
                  <Image
                    key={i}
                    src="/logo/dandelionseed.png"
                    alt=""
                    width={36}
                    height={36}
                    className="absolute select-none"
                    style={{ left: s.left, top: s.top, width: 30, opacity: 0.15, transform: `rotate(${s.rotate})` }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        onClick={open ? closeMenu : openMenu}
        aria-label={open ? "Lukk meny" : "Meny"}
        aria-expanded={open}
        className="relative mr-2 flex h-7 w-7 items-center justify-center transition-opacity hover:opacity-70 active:opacity-50 sm:mr-0 sm:h-8 sm:w-8"
        style={{ color: tone }}
      >
        {/* Samme knapp morfer fra hamburger til kryss — i stedet for én knapp i
            headeren for å åpne og en helt annerledes stylet knapp inni panelet
            for å lukke, som så ut som to forskjellige kontroller for samme ting. */}
        <IconMenu
          className={`absolute h-6 w-6 transition-all duration-200 sm:h-7 sm:w-7 ${
            visible ? "rotate-45 scale-75 opacity-0" : "rotate-0 scale-100 opacity-100"
          }`}
        />
        <IconX
          className={`absolute h-6 w-6 transition-all duration-200 sm:h-7 sm:w-7 ${
            visible ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-75 opacity-0"
          }`}
        />
      </button>
      {panel}
    </>
  );
}
