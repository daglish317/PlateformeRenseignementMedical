import { z } from "zod";

type AuthValidationTranslator = (key: string) => string;

export const createRegisterSchema = (t: AuthValidationTranslator) =>
  z.object({
    nom: z.string().min(1, t("validation.nameRequired")),
    email: z.string().email(t("validation.email")),
    password: z.string().min(8, t("validation.passwordMin")),
    confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("validation.passwordMismatch"),
    path: ["confirmPassword"],
  });

export const registerSchema = createRegisterSchema((key) => key);
