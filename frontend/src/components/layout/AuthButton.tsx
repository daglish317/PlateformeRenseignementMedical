"use client";

import { LogIn, UserCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { useRouter } from "@/i18n/navigation";


export default function AuthButton() {
  const t = useTranslations("auth");

  const router = useRouter();


  /**
   * Temporaire.
   * Cette valeur sera remplacée par AuthProvider
   * lorsque le système JWT sera implémenté.
   */
  const isAuthenticated = false;


  function handleLogin() {
    router.push("/login");
  }


  function handleDashboard() {
    router.push("/dashboard");
  }


  if (isAuthenticated) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleDashboard}
        className="gap-2"
      >
        <UserCircle className="size-4" />

        {t("dashboard")}
      </Button>
    );
  }


  return (
    <Button
      type="button"
      variant="default"
      onClick={handleLogin}
      className="gap-2"
    >
      <LogIn className="size-4" />

      {t("login")}
    </Button>
  );
}