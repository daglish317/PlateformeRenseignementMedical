"use client";

import { useLocale } from "next-intl";
import {
  Activity,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import Logo from "@/components/layout/Logo";

type AuthCardMode = "login" | "register" | "activation";

interface AuthCardProps {
  title: string;
  mode?: AuthCardMode;
  children: React.ReactNode;
}

const COPY = {
  fr: {
    login: {
      eyebrow: "Accès sécurisé",
      title: "Reprenez votre espace en quelques secondes",
      description:
        "Votre rôle, votre structure et vos modules activés déterminent automatiquement le bon dashboard.",
      points: [
        ["Redirection claire", "Propriétaire, gestionnaire et caissier arrivent au bon espace."],
        ["Modules maîtrisés", "Les droits activés pilotent les écrans visibles."],
        ["Interface fluide", "Un parcours lisible sur mobile, tablette et ordinateur."],
      ],
    },
    register: {
      eyebrow: "Création de compte",
      title: "Un accès lié à la structure, pas un simple formulaire",
      description:
        "Le compte rejoint l’espace prévu par l’email pré-enregistré et les permissions définies.",
      points: [
        ["Email reconnu", "L’adresse préparée rattache le compte à la bonne structure."],
        ["Saisie guidée", "Nom, email et mot de passe sont regroupés dans un flux court."],
        ["Accès direct", "Après validation, le système ouvre l’espace autorisé."],
      ],
    },
    activation: {
      eyebrow: "Activation invitée",
      title: "Validez l’email, l’OTP puis finalisez votre accès",
      description:
        "Ce flux est réservé aux propriétaires invités par l’administration SantéProx.",
      points: [
        ["Email validé", "Le compte est lié à l’adresse créée par l’administration."],
        ["OTP sécurisé", "La validation confirme que l’invitation est bien utilisée."],
        ["Accès propriétaire", "Vous terminez avec votre nom et votre mot de passe."],
      ],
    },
  },
  en: {
    login: {
      eyebrow: "Secure access",
      title: "Return to your workspace in seconds",
      description:
        "Your role, structure and enabled modules automatically open the right dashboard.",
      points: [
        ["Clear routing", "Owners, managers and cashiers land in the right workspace."],
        ["Controlled modules", "Enabled permissions decide which screens are visible."],
        ["Fluid interface", "A readable flow across mobile, tablet and desktop."],
      ],
    },
    register: {
      eyebrow: "Account setup",
      title: "Access tied to a structure, not just a form",
      description:
        "The account joins the workspace prepared by the pre-registered email and permissions.",
      points: [
        ["Known email", "The prepared address links the account to the right structure."],
        ["Guided input", "Name, email and password stay in one short flow."],
        ["Direct access", "After validation, the authorized workspace opens."],
      ],
    },
    activation: {
      eyebrow: "Invited activation",
      title: "Validate email, OTP, then complete your access",
      description:
        "This flow is reserved for owners invited by SantéProx administration.",
      points: [
        ["Verified email", "The account is tied to the address created by administration."],
        ["Secure OTP", "Validation confirms the invitation is being used properly."],
        ["Owner access", "Finish with your name and password."],
      ],
    },
  },
} as const;

const modeIcons = {
  login: LockKeyhole,
  register: UsersRound,
  activation: ShieldCheck,
};

const previewMetrics: Array<{ label: string; value: string; icon: LucideIcon }> = [
  { label: "Structures", value: "24", icon: Building2 },
  { label: "Soins", value: "138", icon: Stethoscope },
  { label: "Accès", value: "96%", icon: ClipboardCheck },
];

export function AuthCard({ title, mode = "login", children }: AuthCardProps) {
  const locale = useLocale();
  const language = locale === "fr" ? "fr" : "en";
  const copy = COPY[language][mode];
  const ModeIcon = modeIcons[mode];

  return (
    <section className="w-full">
      <div className="grid min-h-[680px] overflow-hidden rounded-lg border border-border/70 bg-card shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.34)_0%,rgba(5,150,105,0.26)_44%,rgba(15,23,42,0.96)_100%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-white/30" />

          <div className="relative flex h-full flex-col justify-between p-8 xl:p-10">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Logo variant="horizontal" width={132} height={42} priority />
                <Badge className="border-white/10 bg-white/10 text-white hover:bg-white/10">
                  <Sparkles className="size-3.5" />
                  SantéProx
                </Badge>
              </div>

              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  <ModeIcon className="size-3.5" />
                  {copy.eyebrow}
                </div>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
                  {copy.title}
                </h1>
                <p className="max-w-lg text-sm leading-6 text-white/72">
                  {copy.description}
                </p>
              </div>

              <div className="grid gap-3">
                {copy.points.map(([pointTitle, description]) => (
                  <div
                    key={pointTitle}
                    className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-sm backdrop-blur"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{pointTitle}</p>
                      <p className="mt-1 text-xs leading-5 text-white/65">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.08] p-4 shadow-xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/55">
                    Cockpit médical
                  </p>
                  <p className="mt-1 text-lg font-semibold">Vue opérationnelle</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/15">
                  <Activity className="size-5 text-emerald-300" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {previewMetrics.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-lg border border-white/10 bg-slate-950/35 p-3">
                    <Icon className="size-4 text-cyan-300" />
                    <p className="mt-3 text-xl font-semibold">{value}</p>
                    <p className="mt-1 text-[11px] text-white/55">{label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {[
                  ["Pharmacie Centrale", "Modules stock, vente, caisse"],
                  ["Clinique Horizon", "Services, analyses, horaires"],
                  ["Équipe active", "Permissions synchronisées"],
                ].map(([label, description]) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 rounded-md bg-white/[0.06] px-3 py-2"
                  >
                    <MapPin className="size-4 text-blue-300" />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-white">{label}</p>
                      <p className="truncate text-[11px] text-white/50">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-[680px] flex-col bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4 lg:hidden">
            <Logo variant="horizontal" width={118} height={38} priority />
            <Badge variant="secondary">{copy.eyebrow}</Badge>
          </div>

          <div className="flex flex-1 items-center justify-center p-5 sm:p-8">
            <div className="w-full max-w-md">
              <div className="mb-7 space-y-3">
                <Badge variant="secondary" className="w-fit">
                  <ModeIcon className="size-3.5" />
                  {copy.eyebrow}
                </Badge>
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {copy.description}
                  </p>
                </div>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
