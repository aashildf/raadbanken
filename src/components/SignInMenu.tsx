"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconUser } from "@/components/icons";
import { BUTTON_PRIMARY_CLASS, BUTTON_PRIMARY_STYLE } from "@/lib/buttonStyles";
import { useProfile } from "@/lib/useProfile";

/** Liksom-innlogging (se useProfile) — bare et visningsnavn, ikke ekte
    autentisering. Nok til å gi "mine lagrede råd" en følelse av konto uten
    å bygge ordentlig påloggingsflyt før siden faktisk trenger det. */
export function SignInMenu() {
  const { displayName, loaded, signIn, signOut } = useProfile();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!loaded) return <div className="h-4 w-16" aria-hidden="true" />;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs font-normal uppercase tracking-[0.14em] transition-colors hover:text-[#E1B08C]"
      >
        <IconUser className="h-4 w-4" />
        <span className="hidden sm:inline">{displayName ?? "Logg inn"}</span>
      </button>

      {open && (
        <div className="hairline absolute right-0 top-[calc(100%+10px)] z-30 w-64 overflow-hidden rounded-2xl bg-paper p-4 text-ink shadow-2xl">
          {displayName ? (
            <>
              <p className="text-xs uppercase tracking-wide text-ink-soft">Logget inn som</p>
              <p className="font-serif-display mt-0.5 text-lg text-ink">{displayName}</p>
              <Link
                href="/mine-lagrede-rad"
                onClick={() => setOpen(false)}
                className="mt-4 block text-sm font-semibold text-plum-700 transition-colors hover:text-plum-800"
              >
                Mine lagrede råd →
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="mt-3 text-xs text-ink-soft transition-colors hover:text-ink"
              >
                Logg ut
              </button>
            </>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                signIn(name);
                setName("");
                setOpen(false);
              }}
            >
              <p className="text-sm text-ink-soft">
                Ikke ekte innlogging ennå — bare et navn, så du kan finne igjen dine lagrede råd
                senere.
              </p>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Navnet ditt"
                className="mt-3 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-plum-600"
                style={{ background: "rgba(61,46,58,0.04)" }}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className={`mt-3 w-full disabled:opacity-40 ${BUTTON_PRIMARY_CLASS}`}
                style={BUTTON_PRIMARY_STYLE}
              >
                Logg inn
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
