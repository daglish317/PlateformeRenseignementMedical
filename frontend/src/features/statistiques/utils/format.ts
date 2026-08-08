const formatteurMontant = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "XOF",
  maximumFractionDigits: 0,
});

const formatteurNombre = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

export function formatMontant(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined) return "—";
  return formatteurMontant.format(valeur);
}

export function formatNombre(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined) return "—";
  return formatteurNombre.format(valeur);
}

export function formatVariation(
  variation: number | null | undefined
): string {
  if (variation === null || variation === undefined) return "n.c.";
  const signe = variation > 0 ? "+" : "";
  return `${signe}${variation.toLocaleString("fr-FR")} %`;
}
