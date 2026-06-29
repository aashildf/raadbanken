"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "raadbanken-disclaimer-accepted-v1";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  // Anta godtatt under SSR, slik at det ikke flasher på serverrendret HTML.
  // Klienten avgjør det riktige svaret rett etter hydrering.
  return true;
}

function useAccepted() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function DisclaimerGate() {
  const accepted = useAccepted();

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignorer, modalen vises da igjen neste besøk, ikke kritisk
    }
    // Trigger re-evaluation av snapshot for denne fanen (storage-eventet fyres bare i andre faner).
    window.dispatchEvent(new Event("storage"));
  }

  if (accepted) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-plum-950/70 p-4">
      <div className="hairline max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-paper p-6 shadow-2xl sm:p-8">
        <h2 className="font-display text-xl font-bold text-ink">
          Viktig informasjon om innholdet i appen
        </h2>
        <p className="mt-4 text-sm text-ink-soft">
          Innholdet i denne appen (tekst, grafikk, bilder og annet materiale) er kun ment som
          generell informasjon og folkeopplysning om tradisjonelle kjerringråd og husråd.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          <strong className="text-ink">Ikke medisinsk rådgivning:</strong> Innholdet skal ikke under
          noen omstendigheter erstatte profesjonell medisinsk rådgivning, diagnose, undersøkelse
          eller behandling av lege eller annet autorisert helsepersonell.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          <strong className="text-ink">Søk profesjonell hjelp:</strong> Du må aldri ignorere
          profesjonelle medisinske råd eller utsette å søke medisinsk hjelp på grunn av noe du har
          lest i denne appen.
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          <strong className="text-ink">Eget ansvar:</strong> Bruk av rådene i appen skjer helt på
          eget ansvar. Verken utviklerne eller bidragsytere kan holdes rettslig eller økonomisk
          ansvarlig for eventuelle skader, bivirkninger eller tap som følge av bruk av
          informasjonen i appen.
        </p>
        <p className="mt-3 text-sm font-medium text-ink">
          Ved akutt sykdom eller mistanke om alvorlig helseskade, må du umiddelbart kontakte
          legevakt (116 117) eller nødnummer (113).
        </p>

        <button
          onClick={accept}
          className="mt-6 w-full rounded-full bg-plum-800 px-6 py-3 text-sm font-medium text-paper transition-colors hover:bg-plum-700"
        >
          Jeg forstår og godtar
        </button>
      </div>
    </div>
  );
}
