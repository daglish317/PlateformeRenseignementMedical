"use client";

import { Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileContactProps {
  phone: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  error?: string;
}

export function ProfileContact({ phone, isEditing, onChange, error }: ProfileContactProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="telephone" className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          Téléphone
        </Label>
        {isEditing ? (
          <Input
            id="telephone"
            value={phone}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <p className="text-sm">{phone}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
