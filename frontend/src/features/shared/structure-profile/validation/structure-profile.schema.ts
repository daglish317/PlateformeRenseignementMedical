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

export function validateStructureFields(fields: {
  nom?: string;
  telephone?: string;
  adresse?: string;
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

  return errors;
}
