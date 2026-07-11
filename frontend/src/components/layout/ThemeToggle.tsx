"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";


export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const t = useTranslations("theme");

  const [mounted, setMounted] = useState(false);


  useEffect(() => {
    setMounted(true);
  }, []);


  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("toggle")}
        disabled
      />
    );
  }


  const isDark = resolvedTheme === "dark";


  function toggleTheme() {
    setTheme(isDark ? "light" : "dark");
  }


  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={t("toggle")}
      title={
        isDark
          ? t("light")
          : t("dark")
      }
      className="transition-colors"
    >

      {isDark ? (
        <Sun className="size-4" />
      ) : (
        <Moon className="size-4" />
      )}

    </Button>
  );
}