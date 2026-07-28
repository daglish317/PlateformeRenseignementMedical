"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { User } from "lucide-react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import type { UserProfile } from "../types/settings";

interface ProfileCardProps {
  profile: UserProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            {profile.photo ? (
              <AvatarImage src={profile.photo} alt={profile.nom} />
            ) : (
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-semibold">{profile.nom}</h3>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Membre depuis</span>
            <span>{format(new Date(profile.date_joined), "d MMMM yyyy", { locale: fr })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dernière connexion</span>
            <span>
              {profile.last_login
                ? format(new Date(profile.last_login), "d MMMM yyyy 'à' HH:mm", { locale: fr })
                : "—"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
