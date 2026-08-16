import type { CSSProperties } from "react";

export function couleurCSS(variable: string, repli: string): string {
  if (typeof window === "undefined") return repli;
  return (
    getComputedStyle(document.documentElement).getPropertyValue(variable).trim() ||
    repli
  );
}

export function couleurPrincipale(): string {
  return couleurCSS("--primary", "#2563eb");
}

export const COULEURS_NAVIGATION: Record<string, string> = {
  "bg-primary": couleurPrincipale(),
  "bg-cyan-500": "#06b6d4",
  "bg-emerald-500": "#10b981",
  "bg-teal-500": "#14b8a6",
  "bg-orange-500": "#f97316",
  "bg-violet-500": "#8b5cf6",
  "bg-rose-500": "#f43f5e",
  "bg-amber-500": "#f59e0b",
  "bg-sky-500": "#0ea5e9",
};

export const COULEURS_DONUT: readonly string[] = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#06b6d4",
  "#84cc16",
  "#ec4899",
];

export function styleInfoBulle(): CSSProperties {
  return {
    borderRadius: 8,
    border: `1px solid ${couleurCSS("--border", "#e2e8f0")}`,
    background: couleurCSS("--popover", "#ffffff"),
    color: couleurCSS("--popover-foreground", "#0f172a"),
    fontSize: 12,
    boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
  };
}
