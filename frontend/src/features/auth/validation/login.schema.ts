import { z } from "zod";

type AuthValidationTranslator = (key: string) => string;

export const createLoginSchema = (t: AuthValidationTranslator) =>
  z.object({
    email: z.string().email(t("validation.email")),
    password: z.string().min(1, t("validation.passwordRequired")),
  });

export const loginSchema = createLoginSchema((key) => key);
