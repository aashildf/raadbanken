const Z = 1.96; // 95% konfidens

export function wilsonScore(positive: number, total: number): number {
  if (total === 0) return 0;
  const phat = positive / total;
  return (
    (phat + (Z * Z) / (2 * total) - Z * Math.sqrt((phat * (1 - phat) + (Z * Z) / (4 * total)) / total)) /
    (1 + (Z * Z) / total)
  );
}
