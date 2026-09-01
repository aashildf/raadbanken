"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  collection,
  onSnapshot,
  orderBy,
  query as fsQuery,
  limit as fsLimit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES } from "@/lib/categories";
import { MEDICINAL_PLANTS } from "@/lib/plants";
import { IconChevronDown, IconMenu} from "@/components/icons";
import type { Problem, Remedy } from "@/lib/types";

const SEEDS: { left: string; top: string; rotate: string }[] = [
  { left: "76%", top: "9%",  rotate: "22deg"  },
  { left: "60%", top: "4%",  rotate: "-20deg" },
  { left: "88%", top: "62%", rotate: "40deg"  },
];

// "Artikler", "Medisinplanter" og "Historie" er ikke ekte kategorier i
// TOP_CATEGORIES (de har ingen undergrupper/kategori-side), men vises i samme
// liste og med samme forhåndsvisning-med-bilder som Helse/Skjønnhet/Hus&hjem.
type MenuCard = { key: string; href: string; image: string; label: string };
type MenuEntry = { id: string; name: string; tagline: string; href: string; cards: MenuCard[] };

export function SiteMenu() {
  const [open, setOpen]             = useState(false);
  const [visible, setVisible]       = useState(false);
  const [mounted, setMounted]       = useState(false);
  const [problems, setProblems]     = useState<Problem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(TOP_CATEGORIES[0].id);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "problems"), (snap) =>
      setProblems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Problem, "id">) })))
    );
    return unsub;
  }, []);

  const bySlug = useMemo(() => new Map(problems.map((p) => [p.slug, p])), [problems]);

  const menuEntries = useMemo<MenuEntry[]>(() => {
    const categoryEntries: MenuEntry[] = TOP_CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      tagline: cat.tagline,
      href: `/kategori/${cat.id}`,
      cards: (() => {
        const subs = HEALTH_SUBCATEGORIES.filter((s) => s.topCategoryId === cat.id);
        // Undergrupper med eget bilde vises først i forhåndsvisningen — resten
        // fyller opp til 3 kort i original rekkefølge, med kategoriens eget
        // bilde som fallback.
        const withImage = subs.filter((s) => s.image);
        const withoutImage = subs.filter((s) => !s.image);
        return [...withImage, ...withoutImage].slice(0, 3);
      })()
        .map((sub) => {
          const firstProblem = sub.problemSlugs.map((s) => bySlug.get(s)).find(Boolean);
          return {
            key: sub.id,
            href: firstProblem ? `/problem/${firstProblem.id}` : `/kategori/${cat.id}`,
            image: sub.image ?? cat.image,
            label: sub.name,
          };
        }),
    }));

    const extraEntries: MenuEntry[] = [
      {
        id: "artikler",
        name: "Artikler",
        tagline: "Lengre lesestoff om husråd, mat og tradisjoner.",
        href: "/#artikler",
        cards: [
          {
            key: "fiken",
            href: "/artikkel/fiken",
            image: "/pictures/menupictures/fiken_pexels-adriannacalvo-23384641.jpg",
            label: "Fiken",
          },
          {
            key: "tyttebaer",
            href: "/artikkel/tyttebaer",
            image: "/pictures/menupictures/tyytebaer_pexels-sandra-seitamaa-89384773-9669197.jpg",
            label: "Tyttebær",
          },
          {
            key: "syrin",
            href: "/artikkel/syrin",
            image: "/pictures/syrin_pexels-iriser-1431192.jpg",
            label: "Syrin",
          },
        ],
      },
      {
        id: "medisinplanter",
        name: "Medisinplanter",
        tagline: "Urter og planter fra norsk folkemedisin-tradisjon.",
        href: "/medisinplanter",
        cards: MEDICINAL_PLANTS.slice(0, 3).map((p) => ({
          key: p.id,
          href: p.sections ? `/plante/${p.id}` : "/medisinplanter",
          image: p.image?.src ?? "/pictures/solhattmeny.png",
          label: p.name,
        })),
      },
      {
        id: "historie",
        name: "Historie",
        tagline: "Hvordan kjerringråd ble til en muntlig tradisjon, og hvorfor vi samler den igjen.",
        href: "/historie",
        cards: [
          { key: "historie", href: "/historie", image: "/pictures/urter_historie.png", label: "Plantemedisinens historie" },
        ],
      },
    ];

    return [...categoryEntries, ...extraEntries];
  }, [bySlug]);

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
              className="fixed inset-x-0 bottom-0 z-40"
              style={{
                top: "var(--header-height)",
                background: "rgba(20,10,35,0.22)",
                opacity: visible ? 1 : 0,
                transition: "opacity 260ms ease-out",
                pointerEvents: visible ? "auto" : "none",
              }}
            />

            {/* Panel — samme grunn: starter rett under headeren, ikke over den. */}
            <div
              className="fixed left-0 right-0 z-40 flex flex-col overflow-hidden"
              style={{
                top: "var(--header-height)",
                maxHeight: "calc(88vh - var(--header-height))",
                background: "#F9F7E8",
                borderBottomLeftRadius: 28,
                borderBottomRightRadius: 28,
                boxShadow: "0 8px 40px rgba(50,22,72,0.11), 0 2px 6px rgba(50,22,72,0.05)",
                transform: visible ? "translateY(0)" : "translateY(-105%)",
                transition: "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {/* Ingen egen
                  bakgrunnsfarge her (panelet har allerede samme farge) — det lar
                  løvetann-pynten fra bunnen av panelet vises helt opp til krysset
                  i stedet for å bli maskert bort av en ugjennomsiktig stripe. */}
              <div className="relative z-10 shrink-0">
                <div className="pb-3 pt-3" style={{ paddingInline: "max(28px, 6vw)" }}>
                  {/* Krysset er bevisst justert til å lande rett over Meny-ikonet i headeren
                      (ikke rad-paddingen for øvrig), slik at museren ikke må flyttes for å
                      lukke igjen. */}
                  <div className="flex justify-end" style={{ marginRight: "calc(var(--page-pad) - var(--menu-close-adjust) - max(28px, 6vw))" }}>
                    <button
                      onClick={closeMenu}
                      aria-label="Lukk meny"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl font-bold text-ink shadow-md transition-transform hover:scale-105"
                      style={{ background: "#FFFFFF" }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>

              {/* Hovedinnhold: kategorier øverst, nav-kort under — én kolonne i stedet for
                  side om side. overflow-y-auto uansett skjermbredde: greit om innholdet blir
                  høyere enn panelet når en rad er åpen, det skal bare være nåbart via scroll. */}
              <div
                className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto py-4 pb-8"
                style={{ paddingLeft: "max(28px, 6vw)", paddingRight: "max(48px, 7vw)" }}
              >
                {/* Kategorier — Helse/Skjønnhet/Hus&hjem OG Artikler/Medisinplanter/Historie i
                    samme liste. Dropdown-liste på mobil/nettbrett (klikk, ikke hover — det var
                    det som gjorde en tidligere versjon urolig). Fra lg og opp erstattes den av
                    en to-kolonne meny: aktiv rad + beskrivelse til venstre, forhåndsvisning som
                    bilde-kort til høyre, koblet sammen med en liten pil. */}
                <div>
                  <p className="font-display mb-2 text-xl font-bold sm:text-2xl" style={{ color: "#576557" }}>
                    Kategorier
                  </p>
                  <div className="overflow-hidden rounded-xl border border-ink/8 bg-white/40 lg:hidden">
                    {menuEntries.map((entry, i) => {
                      const isExpanded = expandedId === entry.id;
                      return (
                        <div key={entry.id} className={i > 0 ? "border-t border-ink/8" : ""}>
                          <div className="flex items-center">
                            {/* Navnet er en egen lenke til hele siden — pilen ved siden av er en
                                separat knapp som bare styrer utvidelsen, slik at man kan klikke
                                seg inn på f.eks. Helse direkte. */}
                            <Link
                              href={entry.href}
                              onClick={closeMenu}
                              className="flex flex-1 items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/50"
                            >
                              {entry.cards[0] && (
                                <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                                  <Image src={entry.cards[0].image} alt="" fill sizes="44px" className="object-cover" />
                                </span>
                              )}
                              <span className="text-base font-semibold text-ink sm:text-lg">{entry.name}</span>
                            </Link>
                            {entry.cards.length > 0 && (
                              <button
                                onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                                aria-label={isExpanded ? `Skjul underpunkter for ${entry.name}` : `Vis underpunkter for ${entry.name}`}
                                className="flex items-center self-stretch px-3 opacity-50 transition-opacity hover:opacity-80"
                              >
                                <IconChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            )}
                          </div>

                          {isExpanded && entry.cards.length > 0 && (
                            <div className="flex flex-col bg-white/40 pb-2 pl-[4.25rem] pr-3">
                              {entry.cards.map((card) => (
                                <Link
                                  key={card.key}
                                  href={card.href}
                                  onClick={closeMenu}
                                  className="py-1.5 text-sm text-ink/70 transition-colors hover:text-plum-700"
                                >
                                  {card.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Link
                    href="/alle"
                    onClick={closeMenu}
                    className="mt-3 inline-block text-sm font-semibold text-plum-700 transition-opacity hover:opacity-80 lg:hidden"
                  >
                    Se alle kategorier →
                  </Link>

                  {/* Desktop mega-meny (lg+). */}
                  {(() => {
                    const active = menuEntries.find((e) => e.id === activeCategoryId) ?? menuEntries[0];
                    const others = menuEntries.filter((e) => e.id !== active.id);
                    return (
                      <div className="hidden lg:grid lg:grid-cols-[240px_28px_1fr] lg:gap-6 lg:rounded-xl lg:border lg:border-ink/8 lg:bg-white/40 lg:p-6">
                        <div>
                          <Link
                            href={active.href}
                            onClick={closeMenu}
                            className="font-display text-sm font-bold uppercase tracking-wide transition-opacity hover:opacity-80"
                            style={{ color: "#C9A14A" }}
                          >
                            {active.name}
                          </Link>
                          <p className="mt-3 text-sm leading-relaxed text-ink-soft">{active.tagline}</p>
                          <div className="mt-5 flex flex-col gap-3 border-t border-ink/10 pt-4">
                            {others.map((entry) => (
                              <button
                                key={entry.id}
                                onClick={() => setActiveCategoryId(entry.id)}
                                className="text-left text-base font-bold text-ink transition-colors hover:text-plum-700"
                              >
                                {entry.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Koblingen mellom venstre og høyre kolonne — en loddrett strek med en
                            liten pil, for å vise at bildene hører til raden som er åpen til venstre. */}
                        <div className="relative" aria-hidden="true">
                          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-ink/10" />
                          <div
                            className="absolute left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-ink/10"
                            style={{ top: 6, background: "#F9F7E8" }}
                          >
                            <IconChevronDown className="h-3.5 w-3.5 -rotate-90 text-plum-700" />
                          </div>
                        </div>

                        <div>
                          <div className="grid grid-cols-3 gap-6">
                            {active.cards.map((card) => (
                              <Link key={card.key} href={card.href} onClick={closeMenu} className="group">
                                <span className="relative block aspect-4/3 overflow-hidden">
                                  <Image
                                    src={card.image}
                                    alt=""
                                    fill
                                    sizes="220px"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </span>
                                <span className="mt-3 block text-base font-semibold text-ink">{card.label}</span>
                              </Link>
                            ))}
                          </div>
                          <Link
                            href={active.href}
                            onClick={closeMenu}
                            className="mt-6 inline-block text-sm font-semibold text-plum-700 transition-opacity hover:opacity-80"
                          >
                            Se alle →
                          </Link>
                        </div>
                      </div>
                    );
                  })()}
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
        onClick={openMenu}
        aria-label="Meny"
        className="mr-2 flex items-center justify-center transition-opacity hover:opacity-70 sm:mr-0"
        style={{ color: "#3D2E3A" }}
      >
        <IconMenu className="h-6 w-6 sm:h-7 sm:w-7" />
      </button>
      {panel}
    </>
  );
}
