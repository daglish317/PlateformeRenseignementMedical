import { z } from "zod";

export const registerSchema = z.object({
  nom: z.string().min(1, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe doit contenir au moins 8 caractères"),
  confirmPassword: z.string().min(1, "Confirmation du mot de passe requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});
