"use client";

import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Link } from "@/i18n/navigation";
import { Heart, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useLogout } from "@/features/auth/hooks/useLogout";

export default function HeaderActions() {
  const authenticated = useAuthStore((state) => state.authenticated);
  const { mutate: logout, isPending } = useLogout();

  if (authenticated) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <Link href="/favoris">
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" aria-label="Favoris">
            <Heart className="h-5 w-5" />
          </Button>
        </Link>

        <Link href="/profil">
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" aria-label="Profil">
            <User className="h-5 w-5" />
          </Button>
        </Link>

        <LanguageSwitcher />
        <ThemeToggle />

        <Button variant="ghost" size="sm" onClick={() => logout()} disabled={isPending}>
          <LogOut className="mr-2 h-4 w-4" />
          Deconnexion
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href="/favoris">
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-foreground" aria-label="Favoris">
          <Heart className="h-5 w-5" />
        </Button>
      </Link>

      <LanguageSwitcher />
      <ThemeToggle />

      <Link href="/connexion">
        <Button variant="ghost" size="sm">
          Connexion
        </Button>
      </Link>

      <Link href="/inscription">
        <Button size="sm">
          S'inscrire
        </Button>
      </Link>
    </div>
  );
}
