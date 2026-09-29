"use client";

import { useMemo } from "react";
import { HEALTH_SUBCATEGORIES, TOP_CATEGORIES } from "@/lib/categories";

export type MenuCard = { key: string; href: string; image: string; label: string };

/** Ett toppnivå-punkt i navbaren. "dropdown" viser kort på hover/klikk
    (foreløpig bare Kjerringråd, med de fem husråd-kategoriene); "link" er en
    vanlig direkte lenke uten dropdown (Om oss, Lifehacks, Kultur, Planter og
    urter) — akkurat som i referansebildet, der bare "Categories" har en
    pil/dropdown og resten er enkle lenker. */
export type NavItem =
  | { id: string; name: string; href: string; kind: "link" }
  | { id: string; name: string; href: string; kind: "dropdown"; tagline: string; cards: MenuCard[] };

/** Datagrunnlaget for hover-dropdownen i SiteHeader og for mobilmenyen i
    SiteMenu — én kilde, ikke to som kan gli fra hverandre. */
export function useMenuEntries(): NavItem[] {
  return useMemo<NavItem[]>(() => {
    const kjerringradCards: MenuCard[] = TOP_CATEGORIES.map((cat) => {
      // Foretrekker et undergruppe-bilde når kategorien har en (mer
      // spesifikt enn kategoriens eget bilde); de to helt nye kategoriene
      // uten undergrupper enda faller tilbake til kategoriens eget bilde.
      const subWithImage = HEALTH_SUBCATEGORIES.find((s) => s.topCategoryId === cat.id && s.image);
      return {
        key: cat.id,
        href: `/kategori/${cat.id}`,
        image: subWithImage?.image ?? cat.image,
        label: cat.name,
      };
    });

    return [
      { id: "om-oss", name: "Om oss", href: "/om-oss", kind: "link" },
      {
        id: "kjerringrad",
        name: "Kjerringråd",
        href: "/alle",
        kind: "dropdown",
        tagline: "Fem samlinger med gamle husråd, fra klassikerne til det du sanker i skogen.",
        cards: kjerringradCards,
      },
      { id: "lifehacks", name: "Lifehacks", href: "/#artikler", kind: "link" },
      { id: "kultur", name: "Kultur", href: "/historie", kind: "link" },
      { id: "planter", name: "Planter og urter", href: "/medisinplanter", kind: "link" },
    ];
  }, []);
}
