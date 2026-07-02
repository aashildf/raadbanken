function mentionsHoney(text: string) {
  return /honning/i.test(text);
}

export function RemedyDisclaimer({ text = "" }: { text?: string }) {
  return (
    <div className="hairline rounded-xl px-4 py-3 text-sm text-ink-soft" style={{ background: "#EDE4F5" }}>
      <p>
        <strong className="text-ink">Husk på: </strong> Dette rådet er ment som en naturlig hjelp på
        veien, ikke en medisinsk behandling. Lytt alltid til kroppen din: Blir du verre, eller
        har du sterke smerter, bør du la en lege ta en kikk.
      </p>
      {mentionsHoney(text) && (
        <p className="mt-2">
          <strong className="text-ink">Obs:</strong> Honning skal ikke gis til barn under 1 år.
        </p>
      )}
    </div>
  );
}
