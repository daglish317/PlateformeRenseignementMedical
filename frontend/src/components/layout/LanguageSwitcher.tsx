"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  usePathname,
  useRouter,
} from "@/i18n/navigation";


type Locale = "fr" | "en";


export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;

  const t = useTranslations("language");

  const router = useRouter();

  const pathname = usePathname();


  function changeLocale(nextLocale: Locale) {
    if (nextLocale === locale) return;

    router.replace(pathname, {
      locale: nextLocale,
    });
  }


  return (
    <DropdownMenu>

      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            aria-label={t("change")}
            className="gap-2"
          >
            <Globe className="size-4" />

            <span className="text-sm font-medium uppercase">
              {locale}
            </span>
          </Button>
        }
      />


      <DropdownMenuContent
        align="end"
        className="min-w-40"
      >

        <DropdownMenuItem
          onClick={() => changeLocale("fr")}
          disabled={locale === "fr"}
        >
          {t("fr")}
        </DropdownMenuItem>


        <DropdownMenuItem
          onClick={() => changeLocale("en")}
          disabled={locale === "en"}
        >
          {t("en")}
        </DropdownMenuItem>


      </DropdownMenuContent>

    </DropdownMenu>
  );
}