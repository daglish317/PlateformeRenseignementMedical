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


export default function MobileMenu() {
  return (
    <div className="flex lg:hidden items-center">
      
      <Sheet>

        <SheetTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Menu"
            />
          }
        >
          <Menu className="size-5" />
        </SheetTrigger>


        <SheetContent
          side="right"
          className="
            w-[90%]
            sm:max-w-sm
            p-0
          "
        >

          <SheetHeader
            className="
              border-b
              border-border
            "
          >
            <SheetTitle>
              <HeaderLogo />
            </SheetTitle>
          </SheetHeader>


          <div
            className="
              flex
              flex-col
              gap-6
              p-5
            "
          >

            {/* Recherche mobile */}
            <SearchBar />


            {/* Actions */}
            <div
              className="
                flex
                flex-col
                gap-3
              "
            >

              <LanguageSwitcher />

              <ThemeToggle />

              <AuthButton />

            </div>


          </div>


        </SheetContent>

      </Sheet>

    </div>
  );
}