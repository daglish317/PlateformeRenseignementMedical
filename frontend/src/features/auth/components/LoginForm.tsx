"use client";

import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { createLoginSchema } from "@/features/auth/validation/login.schema";
import { useLogin } from "@/features/auth/hooks/useLogin";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-errors";
import { LoginCredentials } from "@/features/auth/types/auth";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const { mutate: login, isPending } = useLogin();
  const secureNote =
    locale === "fr"
      ? "Accès protégé par rôle et permissions de structure."
      : "Access protected by role and structure permissions.";

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(createLoginSchema(t)),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    login(data, {
      onSuccess: () => {
        toast.success(t("loginSuccess"));
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
                  autoComplete="current-password"
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
          {isPending ? t("signingIn") : t("signIn")}
        </Button>

        <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          {secureNote}
        </p>
      </form>
    </Form>
  );
}
