import Link from "next/link";
import { fmt } from "./shared";

// "Bla i arkivet" — kategoriene som store ord med antall råd hevet. Hover
// lar en Ember-markering vokse inn fra venstre (.ravn-topic). Kategoriene
// og tallene er Rådbankens egne (TOP_CATEGORIES + antall råd per kategori),
// ikke prototypens åtte eksempelkategorier.
export function RavnArchive({ topics }: { topics: { id: string; name: string; count: number }[] }) {
  return (
    <section
      className="ravn-section"
      style={{ paddingTop: "clamp(56px,7vw,104px)", paddingBottom: "clamp(56px,7vw,104px)", borderTop: "1px solid var(--ravn-ink)" }}
      aria-labelledby="ravn-archive-h"
    >
      <div className="ravn-wrap flex flex-col gap-7">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id="ravn-archive-h" className="ravn-h2">
            Bla i arkivet
          </h2>
          <span className="ravn-meta">Antall råd i hvert tema</span>
        </div>
        <nav
          aria-label="Temaer"
          className="flex flex-wrap"
          style={{ gap: "0 clamp(18px,2.4vw,40px)", fontSize: "clamp(36px,5.4vw,84px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-.045em" }}
        >
          {topics.map((t) => (
            <Link key={t.id} href={`/kategori/${t.id}`} className="ravn-topic">
              {t.name}
              <sup style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0, lineHeight: 1, marginTop: ".6em", color: "var(--ravn-muted)" }}>
                {fmt(t.count)}
              </sup>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
