import { z } from "zod";
import {
  FORME_PHARMACEUTIQUE_OPTIONS,
  FormePharmaceutiqueValue,
} from "../types/approvisionnement";

const formeValues = FORME_PHARMACEUTIQUE_OPTIONS.map((option) => option.value);

export const ligneSchema = z
  .object({
    nom: z.string().trim().min(1, "Nom du medicament manquant"),
    forme_pharmaceutique: z.enum(
      formeValues as [FormePharmaceutiqueValue, ...FormePharmaceutiqueValue[]],
      { message: "Forme pharmaceutique invalide" }
    ),
    quantite: z.number().min(1, "La quantite doit etre strictement superieure a zero"),
    prix_achat: z
      .number("Le prix d'achat est obligatoire")
      .min(0, "Le prix d'achat est obligatoire"),
    prix_vente: z.number().nullable().optional(),
    date_peremption: z.string().min(1, "Date de peremption obligatoire"),
    tva: z.boolean().default(false),
    en_reserve: z.boolean().default(false),
    stock_avant: z.number().min(0).default(0),
  })
  .refine((ligne) => {
    if (!ligne.date_peremption) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(ligne.date_peremption) >= today;
  }, "La date de peremption ne peut pas etre anterieure a aujourd'hui")
  .refine((ligne) => !(ligne.tva && ligne.prix_vente != null), {
    path: ["prix_vente"],
    message: "Un produit soumis a la TVA ne peut pas avoir de prix de vente",
  })
  .refine((ligne) => ligne.tva || ligne.prix_vente != null, {
    path: ["prix_vente"],
    message: "Le prix de vente est obligatoire si la TVA n'est pas appliquee",
  });

export type LigneFormData = z.infer<typeof ligneSchema>;
