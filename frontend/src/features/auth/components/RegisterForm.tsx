"use client";

import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/features/auth/components/PasswordInput";
import { createRegisterSchema } from "@/features/auth/validation/register.schema";
import { useRegister } from "@/features/auth/hooks/useRegister";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-errors";

type RegisterFormData = z.infer<ReturnType<typeof createRegisterSchema>>;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { mutate: register, isPending } = useRegister();
  const secureNote =
    locale === "fr"
      ? "Les accès sont rattachés aux rôles et aux structures autorisées."
      : "Access is tied to authorized roles and structures.";

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(createRegisterSchema(t)),
    defaultValues: {
      nom: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword: _, ...credentials } = data;

    register(credentials, {
      onSuccess: () => {
        toast.success(t("registerSuccess"));
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(getAuthErrorMessage(error, t("genericError")));
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input
                  placeholder={t("namePlaceholder")}
                  autoComplete="name"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  autoComplete="email"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("password")}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="new-password"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("confirmPassword")}</FormLabel>
              <FormControl>
                <PasswordInput
                  placeholder={t("passwordPlaceholder")}
                  autoComplete="new-password"
                  className="h-11"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="h-11 w-full shadow-sm" disabled={isPending}>
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {isPending ? t("signingUp") : t("signUp")}
        </Button>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          {secureNote}
        </p>
      </form>
    </Form>
  );
}
