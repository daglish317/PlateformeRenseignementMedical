"use client";

import { useRef, useState } from "react";
import { ChevronDown, Heart, LogOut, Menu, MessageSquare } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const [showContactLinks, setShowContactLinks] = useState(false);
  const authenticated = useAuthStore((state) => state.authenticated);
  const { mutate: logout, isPending } = useLogout();

  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;

    const delta = event.changedTouches[0].clientX - touchStartX.current;

    if (delta > 60) {
      setOpen(false);
    }

    touchStartX.current = null;
  }

  return (
    <div className={`flex w-full items-center lg:hidden ${showSearch ? 'gap-1 sm:gap-1.5' : 'justify-between'}`}>
      {/* Logo ultra-minimal */}
      <HeaderLogo />

      {/* Barre de recherche - MAXIMALE */}
      {showSearch && (
        <div className="relative z-[10000] flex-1 min-w-0">
          <SearchBar />
        </div>
      )}

      {/* Actions rapides pour pages sans recherche */}
      {!showSearch && (
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      )}

      {/* Menu */}
      <Sheet
        open={open}
        onOpenChange={setOpen}
      >
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
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="w-[85%] p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b border-border px-4 sm:px-5">
            <SheetTitle>
              Menu
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-5">
            <LanguageSwitcher />
            <ThemeToggle />

            {showSearch && (
              <div className="rounded-xl border border-border bg-muted/20 p-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 text-left text-sm font-medium text-foreground"
                  onClick={() => setShowContactLinks((value) => !value)}
                >
                  <span className="inline-flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    Nous contacter
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      showContactLinks ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showContactLinks && (
                  <div className="mt-3 flex flex-col gap-2">
                    <Link href={authenticated ? "/contact" : "/inscription?returnTo=/contact"}>
                      <Button variant="ghost" className="w-full justify-start rounded-lg">
                        Me contacter
                      </Button>
                    </Link>
                    <Link href={authenticated ? "/feedback" : "/inscription?returnTo=/feedback"}>
                      <Button variant="ghost" className="w-full justify-start rounded-lg">
                        Laisser un avis
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {authenticated ? (
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full justify-start text-destructive"
                  onClick={() => logout()}
                  disabled={isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
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

            <Link href="/favoris">
              <Button variant="ghost" className="w-full justify-start">
                <Heart className="mr-2 h-4 w-4" />
                Favoris
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
