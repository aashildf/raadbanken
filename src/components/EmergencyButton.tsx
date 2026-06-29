"use client";

import { useState } from "react";
import { IconPhone } from "@/components/icons";

export function EmergencyButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Akutt hjelp"
        title="Akutt hjelp"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-rust text-white shadow-md transition-colors hover:bg-rust/90"
      >
        <IconPhone className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-zinc-900/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-medium text-zinc-900">
              Er smertene akutte eller uforklarlige?
            </p>
            <p className="mt-2 text-sm text-zinc-600">
              Ring Legevakten på <strong>116 117</strong> (gratis, døgnåpent). Ved livstruende
              tilstander, ring 113.
            </p>
            <a
              href="tel:116117"
              className="mt-4 block rounded-full bg-rust px-4 py-3 font-medium text-white transition-colors hover:bg-rust/90"
            >
              Ring 116 117
            </a>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 text-sm text-zinc-500 hover:text-zinc-700"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </>
  );
}
