export function validateOpeningClosing(
  opening: string,
  closing: string,
  estFerme: boolean
): string | null {
  if (estFerme) return null;
  if (!opening || !closing) return "Les horaires sont requis.";
  return null;
}

export function isTwentyFourHours(opening: string, closing: string): boolean {
  return Boolean(opening && closing && opening === closing);
}

export function validateSchedule(schedule: {
  heure_ouverture: string;
  heure_fermeture: string;
  est_ferme: boolean;
}): string | null {
  if (!schedule.est_ferme && isTwentyFourHours(schedule.heure_ouverture, schedule.heure_fermeture)) {
    return null;
  }

  return validateOpeningClosing(
    schedule.heure_ouverture,
    schedule.heure_fermeture,
    schedule.est_ferme
  );
}
