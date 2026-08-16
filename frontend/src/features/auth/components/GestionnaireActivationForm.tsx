"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/features/auth/api/auth.service";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { getAuthErrorMessage } from "@/features/auth/utils/auth-errors";
import { PasswordInput } from "./PasswordInput";

interface GestionnaireActivationFormProps {
  onSuccess?: () => void;
  onBackToRegister?: () => void;
}

export function GestionnaireActivationForm({
  onSuccess,
  onBackToRegister,
}: GestionnaireActivationFormProps) {
  const t = useTranslations("auth");
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [nom, setNom] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<"email" | "otp" | "password">("email");
  const [viaOtp, setViaOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authService.checkGestionnaire(email);
      if (result.is_invited && result.requires_otp) {
        setViaOtp(true);
        setStep("otp");
      } else if (result.is_invited) {
        setViaOtp(false);
        setStep("password");
      } else {
        setError(t("manager.pendingNotFound"));
      }
    } catch {
      setError(t("manager.pendingNotFound"));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (nextCode?: string) => {
    const code = nextCode ?? otpDigits.join("");
    if (code.length !== 4) return;

    setLoading(true);
    setError(null);

    try {
      await authService.validateGestionnaireOtp(email, code);
      setStep("password");
    } catch {
      setError(t("manager.otpInvalid"));
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

    if (newDigits.every((digit) => digit !== "")) {
      handleVerifyOtp(newDigits.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();

    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const newDigits = [...otpDigits];
    for (let i = 0; i < 4; i += 1) {
      newDigits[i] = pasted[i] ?? "";
    }

    setOtpDigits(newDigits);

    if (newDigits.every((digit) => digit !== "")) {
      handleVerifyOtp(newDigits.join(""));
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError(t("manager.passwordMismatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("manager.passwordMin"));
      return;
    }

    if (nom.trim().length < 3) {
      setError("Le nom complet est requis.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auth = await authService.activateGestionnaire(email, password, nom.trim());
      toast.success(t("manager.activated"));
      setAuth(auth);
      onSuccess?.();
    } catch (err) {
      setError(getAuthErrorMessage(err, t("genericError")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {step === "email" && (
        <form onSubmit={handleCheckEmail} className="space-y-4">
          <p className="text-sm text-muted-foreground">{t("manager.emailHelp")}</p>
          <div className="space-y-2">
            <Label htmlFor="gest-email">{t("email")}</Label>
            <Input
              id="gest-email"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading || !email}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("manager.checking")}
              </>
            ) : (
              t("manager.checkEmail")
            )}
          </Button>
          {onBackToRegister && (
            <button
              type="button"
              onClick={onBackToRegister}
              className="mx-auto flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("manager.backToRegister")}
            </button>
          )}
        </form>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {t("manager.otpHelp")}{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="flex justify-center gap-3">
            {otpDigits.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                className="h-14 w-14 text-center text-lg font-semibold"
                disabled={loading}
                autoFocus={index === 0}
              />
            ))}
          </div>
          {error && <p className="text-center text-sm text-destructive">{error}</p>}
          <Button
            className="w-full"
            disabled={otpDigits.some((digit) => digit === "") || loading}
            onClick={() => handleVerifyOtp()}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("manager.checking")}
              </>
            ) : (
              t("manager.verifyCode")
            )}
          </Button>
        </div>
      )}

      {step === "password" && (
        <form onSubmit={handleSetPassword} className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {viaOtp ? t("manager.passwordHelp") : t("manager.passwordHelpDirect")}{" "}
            <span className="font-medium text-foreground">{email}</span>
          </p>
          <div className="space-y-2">
            <Label htmlFor="gest-name">Nom complet</Label>
            <Input
              id="gest-name"
              type="text"
              placeholder="Jean Dupont"
              value={nom}
              onChange={(e) => {
                setNom(e.target.value);
                setError(null);
              }}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gest-password">{t("password")}</Label>
            <PasswordInput
              id="gest-password"
              placeholder={t("manager.passwordMinPlaceholder")}
              value={password}
              autoComplete="new-password"
              onChange={(e) => {
                setPassword(e.target.value);
                setError(null);
              }}
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gest-confirm">{t("confirmPassword")}</Label>
            <PasswordInput
              id="gest-confirm"
              placeholder={t("manager.confirmPasswordPlaceholder")}
              value={confirmPassword}
              autoComplete="new-password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError(null);
              }}
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            className="w-full"
            disabled={loading || !nom || !password || !confirmPassword}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("manager.activating")}
              </>
            ) : (
              t("manager.activate")
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
