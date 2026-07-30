"use client";

import ThemeToggle from "@/components/layout/ThemeToggle";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function PreferencesForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Préférences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Thème</p>
            <p className="text-xs text-muted-foreground">
              Choisir entre le thème clair ou sombre
            </p>
          </div>
          <ThemeToggle />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Langue</p>
            <p className="text-xs text-muted-foreground">
              Choisir la langue de l&apos;interface
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </CardContent>
    </Card>
  );
}
