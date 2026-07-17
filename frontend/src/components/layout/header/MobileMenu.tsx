"use client";

import { Menu, Heart, LogOut, User } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import HeaderLogo from "./HeaderLogo";

import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useLogout } from "@/features/auth/hooks/useLogout";

import { SearchBar } from "@/components/common/search";

type MobileMenuProps = {
  showSearch?: boolean;
};

export default function MobileMenu({ showSearch = true }: MobileMenuProps) {
  const t = useTranslations("auth");
  const authenticated = useAuthStore((state) => state.authenticated);
  const { mutate: logout, isPending } = useLogout();

  return (
    <div className="flex w-full items-center gap-2 sm:gap-3 lg:hidden">
      {/* Logo */}
      <HeaderLogo />

      {/* Barre de recherche */}
      <div className="flex-1 min-w-0">
        {showSearch && <SearchBar />}
      </div>

      {/* Menu */}
      <Sheet>
        <SheetTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Ouvrir le menu"
              className="shrink-0"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-[90%] sm:w-[85%] p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b border-border px-4 sm:px-5">
            <SheetTitle>
              <HeaderLogo />
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 sm:gap-6 p-4 sm:p-5">
            <LanguageSwitcher />
            <ThemeToggle />

            {authenticated ? (
              <div className="flex flex-col gap-3">
                <Link href="/favoris">
                  <Button variant="ghost" className="w-full justify-start">
                    <Heart className="h-4 w-4 mr-2" />
                    Favoris
                  </Button>
                </Link>
                <Link href="/profil">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => logout()}
                  disabled={isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link href="/connexion">
                  <Button variant="ghost" className="w-full justify-start">
                    {t("login")}
                  </Button>
                </Link>
                <Link href="/inscription">
                  <Button className="w-full justify-start">
                    {t("register")}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}