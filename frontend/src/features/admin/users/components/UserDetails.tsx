"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Mail, Calendar, Clock, Heart, MessageSquare } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { UserAvatar } from "./UserAvatar";
import { UserStatusBadge } from "./UserStatusBadge";
import type { UserAdmin } from "../types/user";

interface UserDetailsProps {
  user: UserAdmin | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}

export function UserDetails({ user, open, onOpenChange }: UserDetailsProps) {
  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Détails de l'utilisateur</SheetTitle>
        </SheetHeader>

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <UserAvatar nom={user.nom} className="h-16 w-16 rounded-xl text-lg" />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold">{user.nom}</h3>
              <div className="mt-1">
                <UserStatusBadge isActive={user.is_active} />
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <InfoRow icon={Mail} label="Email" value={user.email} />
            <InfoRow
              icon={Calendar}
              label="Date d'inscription"
              value={format(new Date(user.date_joined), "dd MMMM yyyy", { locale: fr })}
            />
            <InfoRow
              icon={Clock}
              label="Dernière connexion"
              value={
                user.last_login
                  ? format(new Date(user.last_login), "dd MMMM yyyy à HH:mm", { locale: fr })
                  : null
              }
            />
          </div>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Heart className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Favoris</p>
                <p className="text-sm">{user.favoris_count}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Feedbacks</p>
                <p className="text-sm">{user.feedbacks_count}</p>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
