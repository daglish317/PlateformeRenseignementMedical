import { z } from "zod";
import {
  FORME_PHARMACEUTIQUE_OPTIONS,
  FormePharmaceutiqueValue,
} from "../types/approvisionnement";

const formeValues = FORME_PHARMACEUTIQUE_OPTIONS.map((option) => option.value);

export const ligneSchema = z
  .object({
    nom: z.string().trim().min(1, "Nom du médicament manquant"),
    forme_pharmaceutique: z.enum(
      formeValues as [FormePharmaceutiqueValue, ...FormePharmaceutiqueValue[]],
      { message: "Forme pharmaceutique invalide" }
    ),
    quantite: z.number().min(1, "La quantité doit être strictement supérieure à zéro"),
    prix_achat: z
      .number("Le prix d'achat est obligatoire")
      .min(0, "Le prix d'achat est obligatoire"),
    prix_vente: z.number().nullable().optional(),
    date_peremption: z.string().min(1, "Date de péremption obligatoire"),
    tva: z.boolean().default(false),
    en_reserve: z.boolean().default(false),
  })
  .refine((ligne) => {
    if (!ligne.date_peremption) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(ligne.date_peremption) >= today;
  }, "La date de péremption ne peut pas être antérieure à aujourd'hui");

export type LigneFormData = z.infer<typeof ligneSchema>;
