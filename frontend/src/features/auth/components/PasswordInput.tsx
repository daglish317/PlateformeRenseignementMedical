"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({ className, id, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const toggleLabel = showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe";

  return (
    <div className="relative">
      <Input
        id={id}
        type={showPassword ? "text" : "password"}
        className={className ? `${className} pr-12` : "pr-12"}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={toggleLabel}
        title={toggleLabel}
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
}
