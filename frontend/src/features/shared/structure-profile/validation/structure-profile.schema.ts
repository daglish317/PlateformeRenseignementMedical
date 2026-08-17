export interface ValidationError {
  field: string;
  message: string;
}

export function validateName(name: string): string | null {
  if (!name || name.trim().length < 2) {
    return "Le nom doit contenir au moins 2 caractères";
  }
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone || phone.trim().length === 0) {
    return "Le téléphone est requis";
  }
  const phoneRegex = /^[+]?[\d\s\-()]{8,20}$/;
  if (!phoneRegex.test(phone.trim())) {
    return "Format de téléphone invalide";
  }
  return null;
}

export function validateAddress(address: string): string | null {
  if (!address || address.trim().length === 0) {
    return "L'adresse est requise";
  }
  return null;
}

export function validateCoordinates(latitude?: string, longitude?: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lat = latitude?.trim() ?? "";
  const lon = longitude?.trim() ?? "";

  if (!lat && !lon) {
    return errors;
  }

  if (!lat || !lon) {
    if (!lat) errors.push({ field: "latitude", message: "La latitude est requise avec la longitude" });
    if (!lon) errors.push({ field: "longitude", message: "La longitude est requise avec la latitude" });
    return errors;
  }

  const latNumber = Number(lat);
  const lonNumber = Number(lon);

  if (!Number.isFinite(latNumber) || latNumber < -90 || latNumber > 90) {
    errors.push({ field: "latitude", message: "Latitude invalide (-90 à 90)" });
  }

  if (!Number.isFinite(lonNumber) || lonNumber < -180 || lonNumber > 180) {
    errors.push({ field: "longitude", message: "Longitude invalide (-180 à 180)" });
  }

  return errors;
}

export function validateStructureFields(fields: {
  nom?: string;
  telephone?: string;
  adresse?: string;
  latitude?: string;
  longitude?: string;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (fields.nom !== undefined) {
    const error = validateName(fields.nom);
    if (error) errors.push({ field: "nom", message: error });
  }

  if (fields.telephone !== undefined) {
    const error = validatePhone(fields.telephone);
    if (error) errors.push({ field: "telephone", message: error });
  }

  if (fields.adresse !== undefined) {
    const error = validateAddress(fields.adresse);
    if (error) errors.push({ field: "adresse", message: error });
  }

  errors.push(...validateCoordinates(fields.latitude, fields.longitude));

  return errors;
}
