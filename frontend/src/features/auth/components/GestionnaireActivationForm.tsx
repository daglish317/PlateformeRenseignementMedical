"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-errors";

interface GestionnaireActivationFormProps {
  onSuccess?: () => void;
  onBackToRegister?: () => void;
}

export function GestionnaireActivationForm({ onSuccess, onBackToRegister }: GestionnaireActivationFormProps) {
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await authService.checkGestionnaire(email);
      if (result.is_gestionnaire) {
        setStep("otp");
      } else {
        setError("Aucun compte gestionnaire en attente trouvé avec cet email.");
      }
    } catch {
      setError("Aucun compte gestionnaire en attente trouvé avec cet email.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join("");
    if (code.length !== 4) return;
    setLoading(true);
    setError(null);
    try {
      await authService.checkGestionnaire(email);
      setStep("password");
    } catch {
      setError("Erreur lors de la vérification.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setError(null);
    if (newDigits.every((d) => d !== "")) {
      handleVerifyOtp();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 4; i++) {
      newDigits[i] = pasted[i] ?? "";
    }
    setOtpDigits(newDigits);
    if (newDigits.every((d) => d !== "")) {
      handleVerifyOtp();
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const auth = await authService.activateGestionnaire(email, otpDigits.join(""), password);
      toast.success("Compte activé avec succès");
      setAuth(auth);
      onSuccess?.();
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === "email" && (
        <form onSubmit={handleCheckEmail} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Entrez l&apos;email utilisé lors de la création de votre compte gestionnaire.
          </p>
          <div className="space-y-2">
            <Label htmlFor="gest-email">Email</Label>
            <Input
              id="gest-email"
              type="email"
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier mon email"
            )}
          </Button>
          {onBackToRegister && (
            <button
              type="button"
              onClick={onBackToRegister}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mx-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à l&apos;inscription
            </button>
          )}
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Entrez le code à 4 chiffres envoyé à <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="flex justify-center gap-3">
            {otpDigits.map((digit, i) => (
              <Input
                key={i}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                className="h-14 w-14 text-center text-lg font-semibold"
                disabled={loading}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button
            className="w-full"
            disabled={otpDigits.some((d) => d === "") || loading}
            onClick={handleVerifyOtp}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vérification...
              </>
            ) : (
              "Vérifier le code"
            )}
          </Button>
        </div>
      )}

      {step === "password" && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Code vérifié. Définissez votre mot de passe pour <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="gest-password">Mot de passe</Label>
            <Input
              id="gest-password"
              type="password"
              placeholder="Minimum 8 caractères"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gest-confirm">Confirmer le mot de passe</Label>
            <Input
              id="gest-confirm"
              type="password"
              placeholder="Retapez le mot de passe"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !password || !confirmPassword}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activation...
              </>
            ) : (
              "Activer mon compte"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
