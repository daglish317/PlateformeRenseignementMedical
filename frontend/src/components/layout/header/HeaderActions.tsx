"use client";

import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { Heart, LogOut, MessageSquare } from "lucide-react";

type HeaderActionsProps = {
  showPublicLinks?: boolean;
};

type ContactMenuProps = {
  contactHref: string;
  feedbackHref: string;
};

function ContactMenu({
  contactHref,
  feedbackHref,
}: ContactMenuProps) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        aria-label="Ouvrir les liens de contact"
      >
        <MessageSquare className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuItem onClick={() => router.push(contactHref)}>
          Me contacter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(feedbackHref)}>
          Laisser un avis
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function HeaderActions({
  showPublicLinks = false,
}: HeaderActionsProps) {
  const authenticated = useAuthStore((state) => state.authenticated);
  const { mutate: logout, isPending } = useLogout();

  const contactHref = authenticated
    ? "/contact"
    : "/inscription?returnTo=/contact";
  const feedbackHref = authenticated
    ? "/feedback"
    : "/inscription?returnTo=/feedback";

  if (authenticated) {
    return (
      <div className="flex items-center gap-3 shrink-0">
        {showPublicLinks && (
          <ContactMenu contactHref={contactHref} feedbackHref={feedbackHref} />
        )}

        <Link href="/favoris">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground"
            aria-label="Favoris"
          >
            <Heart className="h-5 w-5" />
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
    <div className="flex items-center gap-3 shrink-0">
      {showPublicLinks && (
        <ContactMenu contactHref={contactHref} feedbackHref={feedbackHref} />
      )}

      <Link href="/favoris">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-muted-foreground hover:text-foreground"
          aria-label="Favoris"
        >
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
        <Button size="sm">S&apos;inscrire</Button>
      </Link>
    </div>
  );
}
