"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MEGA_CATEGORIES, MOBILE_LINKS } from "@/lib/megaMenu";
import { useSiteSearch } from "@/lib/useSiteSearch";
import { SecondaryButton } from "@/components/Button";
import { SignInMenu } from "@/components/SignInMenu";
import { Paper } from "@/components/Paper";
import { IconChevronDown, IconMenu, IconSearch, IconX } from "@/components/icons";

// Mobilmeny (hamburger-panel) — gjenskapt 1:1 fra
// design/design_handoff_radbanken_forside/fasit/komponent-navbar.html,
// seksjonen .mm. Panel fra høyre, maks 420px, mørk papirbunn, Esc/klikk
// utenfor lukker. Søket gjenbruker useSiteSearch (samme hook som
// desktop-søket i SiteHeader) i stedet for et eget, dupisert oppslag.
export function SiteMenu({ tone = "#3D2E3A" }: { tone?: string }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [catsOpen, setCatsOpen] = useState(true);
  const { query, setQuery, results, suggestions } = useSiteSearch();

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  function openMenu() {
    setOpen(true);
    setTimeout(() => setVisible(true), 12);
  }

  function closeMenu() {
    setVisible(false);
    setTimeout(() => setOpen(false), 400);
  }

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const panel =
    open && mounted
      ? createPortal(
          <div className="fixed inset-0 z-[100]">
            <div
              onClick={closeMenu}
              className="absolute inset-0 transition-opacity duration-[350ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)]"
              style={{ background: "rgba(17,17,16,.55)", opacity: visible ? 1 : 0 }}
            />
            <aside
              role="dialog"
              aria-modal="true"
              aria-label="Meny"
              className="absolute inset-y-0 right-0 overflow-y-auto transition-transform duration-[450ms] [transition-timing-function:cubic-bezier(0.3,0.6,0.25,1)]"
              style={{
                width: "min(420px, 100%)",
                background: "#111110",
                color: "#f5eee0",
                transform: visible ? "none" : "translateX(100%)",
              }}
            >
              <Paper id="mm" variant="dark" mottle={false} />
              <div className="relative z-10 flex min-h-full flex-col gap-[22px] px-5 pb-7 pt-2">
                <div className="flex h-14 items-center justify-between">
                  <Link href="/" onClick={closeMenu} className="flex items-center">
                    <Image src="/ravn/ravn-logo.png" alt="RAVN" width={282} height={271} className="h-10 w-auto" />
                  </Link>
                  <button
                    onClick={closeMenu}
                    aria-label="Lukk meny"
                    className="no-focus-ring -m-2.5 grid h-11 w-11 place-items-center rounded-[2px] transition-colors hover:text-[#a93415]"
                  >
                    <IconX className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative">
                  <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#d4c9b3]" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    type="search"
                    placeholder="Søk i råd …"
                    aria-label="Søk i råd"
                    className="no-focus-ring h-[50px] w-full rounded-[2px] pl-11 pr-3.5 font-figtree text-base text-[#f5eee0] placeholder:text-[rgba(245,238,224,0.6)] focus:[box-shadow:inset_0_0_0_2px_#a93415]"
                    style={{ background: "rgba(239,230,207,.06)", boxShadow: "inset 0 0 0 1px rgba(239,230,207,.28)" }}
                  />
                  {query.trim() && (
                    <div className="mt-2 overflow-hidden rounded-[2px]" style={{ background: "rgba(239,230,207,.06)", boxShadow: "inset 0 0 0 1px rgba(239,230,207,.2)" }}>
                      {results.length > 0 ? (
                        <ul>
                          {results.map((r) => (
                            <li key={`${r.type}-${r.id}`}>
                              <Link
                                href={r.type === "problem" ? `/problem/${r.id}` : `/remedy/${r.id}`}
                                onClick={closeMenu}
                                className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-sm transition-colors hover:bg-white/5"
                                style={{ borderBottom: "1px solid rgba(239,230,207,.12)" }}
                              >
                                <span className="truncate font-medium">{r.label}</span>
                                <span className="shrink-0 text-xs uppercase tracking-wide text-[rgba(245,238,224,0.6)]">{r.sub}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-3.5 py-3">
                          <p className="text-sm text-[rgba(245,238,224,0.7)]">Fant ingen treff på «{query.trim()}».</p>
                          {suggestions.length > 0 && (
                            <ul className="mt-2 flex flex-wrap gap-2">
                              {suggestions.map((s) => (
                                <li key={`${s.type}-${s.id}`}>
                                  <Link
                                    href={s.type === "problem" ? `/problem/${s.id}` : `/remedy/${s.id}`}
                                    onClick={closeMenu}
                                    className="rounded-[2px] px-3 py-1 text-sm"
                                    style={{ boxShadow: "inset 0 0 0 1px rgba(239,230,207,.28)" }}
                                  >
                                    {s.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setCatsOpen((o) => !o)}
                  aria-expanded={catsOpen}
                  aria-controls="mm-cats"
                  className="font-lora flex min-h-11 w-full items-center justify-between text-[15px] font-medium uppercase tracking-[0.16em]"
                  style={{ color: "#d4c9b3" }}
                >
                  <span>Utforsk</span>
                  <IconChevronDown className={`h-4 w-4 transition-transform duration-500 ${catsOpen ? "rotate-180" : ""}`} />
                </button>
                {catsOpen && (
                  <ul id="mm-cats" className="grid grid-cols-2 gap-2">
                    {MEGA_CATEGORIES.map((cat) => (
                      <li key={cat.label}>
                        <Link
                          href={cat.href}
                          onClick={closeMenu}
                          className="flex min-h-[52px] items-center gap-2.5 rounded-[6px] bg-[#111110] px-3 py-2.5 font-figtree text-sm font-semibold text-[#f5eee0] shadow-[inset_0_0_0_2px_transparent] transition-colors hover:bg-[#efe6cf] hover:text-[#111110] hover:shadow-[inset_0_0_0_2px_#a93415]"
                        >
                          <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                            <path d={cat.d} />
                          </svg>
                          <span>{cat.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <ul style={{ borderTop: "1px solid rgba(239,230,207,.14)" }}>
                  {MOBILE_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        className="font-lora flex min-h-14 items-center text-xl transition-colors hover:text-[#a93415]"
                        style={{ borderBottom: "1px solid rgba(239,230,207,.14)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto flex flex-col gap-3 pt-2">
                  <SecondaryButton href="/del-rad" tone="dark" onClick={closeMenu} className="w-full">
                    Del et råd
                  </SecondaryButton>
                  <div className="flex justify-center py-1">
                    <SignInMenu />
                  </div>
                </div>
              </div>
            </aside>
          </div>,
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
