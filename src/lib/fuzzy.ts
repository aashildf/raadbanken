function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);

  for (let i = 1; i <= m; i++) {
    let prevDiag = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prevDiag : 1 + Math.min(prevDiag, dp[j], dp[j - 1]);
      prevDiag = tmp;
    }
  }
  return dp[n];
}

// 1 = identisk, 0 = helt forskjellig
export function similarity(a: string, b: string): number {
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  if (!x || !y) return 0;
  const dist = levenshtein(x, y);
  return 1 - dist / Math.max(x.length, y.length);
}

export function bestPartialSimilarity(query: string, text: string): number {
  const q = query.toLowerCase().trim();
  const t = text.toLowerCase().trim();
  if (!q || !t) return 0;
  if (t.includes(q)) return 1;
  const words = t.split(/\s+/);
  let best = similarity(q, t);
  for (const w of words) {
    best = Math.max(best, similarity(q, w));
  }
  return best;
}
