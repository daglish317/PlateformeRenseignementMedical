export function validateOpeningClosing(
  opening: string,
  closing: string,
  estFerme: boolean
): string | null {
  if (estFerme) return null;
  if (!opening || !closing) return "Les horaires sont requis.";
  return null;
}

export function validateSchedule(schedule: {
  heure_ouverture: string;
  heure_fermeture: string;
  est_ferme: boolean;
}): string | null {
  return validateOpeningClosing(
    schedule.heure_ouverture,
    schedule.heure_fermeture,
    schedule.est_ferme
  );
}
