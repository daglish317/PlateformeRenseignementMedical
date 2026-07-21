"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

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

    if (nextLocale === locale) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.replace(pathname as any, {
      locale: nextLocale,
    });

  }


  return (

    <DropdownMenu>

      <DropdownMenuTrigger
        className="
          inline-flex
          items-center
          gap-2
          rounded-md
          px-3
          py-2
          text-sm
          font-medium
          hover:bg-accent
          hover:text-accent-foreground
        "
        aria-label={t("change")}
      >

        <Globe className="size-4" />

        <span className="uppercase">
          {locale}
        </span>

      </DropdownMenuTrigger>


      <DropdownMenuContent
        align="end"
        className="min-w-40"
      >

        <DropdownMenuItem
          onClick={() => changeLocale("fr")}
          disabled={locale === "fr"}
        >
          Français
        </DropdownMenuItem>


        <DropdownMenuItem
          onClick={() => changeLocale("en")}
          disabled={locale === "en"}
        >
          English
        </DropdownMenuItem>


      </DropdownMenuContent>


    </DropdownMenu>

  );
}