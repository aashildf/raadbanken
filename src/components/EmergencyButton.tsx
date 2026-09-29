"use client";

import { useEffect, useState } from "react";
import { IconPhone } from "@/components/icons";

export function EmergencyButton() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  function openModal() {
    setMounted(true);
  }

  function closeModal() {
    setVisible(false);
    window.setTimeout(() => setMounted(false), 200);
  }

  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);

  return (
    <>
      <button
        onClick={openModal}
        aria-label="Akutt hjelp"
        title="Akutt hjelp"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-rust text-white shadow-md transition hover:bg-rust/90 active:scale-[0.97]"
      >
        <IconPhone className="h-4 w-4" />
      </button>

      {mounted && (
        <div
          className={`modal-scrim fixed inset-0 z-100 flex items-center justify-center bg-zinc-900/60 p-4 ${visible ? "is-visible" : ""}`}
          onClick={closeModal}
        >
          <div
            className={`modal-panel w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl ${visible ? "is-visible" : ""}`}
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
              className="mt-4 block rounded-full bg-rust px-4 py-3 font-medium text-white transition hover:bg-rust/90 active:scale-[0.97]"
            >
              Ring 116 117
            </a>
            <button
              onClick={closeModal}
              className="mt-3 text-sm text-zinc-500 transition hover:text-zinc-700 active:scale-[0.97]"
            >
              Lukk
            </button>
          </div>
        </div>
      )}
    </>
  );
}
