import { z } from "zod";

export const stockSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  type_item: z.enum(["MEDICAMENT", "EQUIPEMENT", "CONSOMMABLE"]),
  quantite: z.number().min(0, "La quantité ne peut pas être négative"),
  seuil_alerte: z.number().min(0, "Le seuil d'alerte ne peut pas être négatif"),
  disponible: z.boolean().optional(),
});

export type StockFormData = z.infer<typeof stockSchema>;
