"use client";

import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import HeaderLogo from "./HeaderLogo";

import AuthButton from "@/components/layout/AuthButton";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/layout/ThemeToggle";

import { SearchBar } from "@/components/common/search";
type MobileMenuProps = {
  showSearch?: boolean;
};
export default function MobileMenu({ showSearch = true }: MobileMenuProps) {
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

            <AuthButton />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}