export const THEME = {
  emergency: {
    stroke: {
      background: "bg-violet-500/10",
      surface: "bg-violet-500/5",
      border: "border-violet-500/20",
      icon: "text-violet-600 dark:text-violet-400",
      shadow: "shadow-violet-500/15",
      ring: "ring-violet-500/20",
    },

    cardiac: {
      background: "bg-red-500/10",
      surface: "bg-red-500/5",
      border: "border-red-500/20",
      icon: "text-red-600 dark:text-red-400",
      shadow: "shadow-red-500/15",
      ring: "ring-red-500/20",
    },

    accident: {
      background: "bg-orange-500/10",
      surface: "bg-orange-500/5",
      border: "border-orange-500/20",
      icon: "text-orange-600 dark:text-orange-400",
      shadow: "shadow-orange-500/15",
      ring: "ring-orange-500/20",
    },

    burn: {
      background: "bg-amber-500/10",
      surface: "bg-amber-500/5",
      border: "border-amber-500/20",
      icon: "text-amber-600 dark:text-amber-400",
      shadow: "shadow-amber-500/15",
      ring: "ring-amber-500/20",
    },
  },

  structure: {
    hospital: {
      background: "bg-primary/10",
      border: "border-primary/20",
      icon: "text-primary",
    },

    pharmacy: {
      background: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: "text-emerald-600 dark:text-emerald-400",
    },
  },

  status: {
    success: {
      background: "bg-emerald-500/10",
      text: "text-emerald-600 dark:text-emerald-400",
    },

    warning: {
      background: "bg-amber-500/10",
      text: "text-amber-600 dark:text-amber-400",
    },

    error: {
      background: "bg-red-500/10",
      text: "text-red-600 dark:text-red-400",
    },

    info: {
      background: "bg-primary/10",
      text: "text-primary",
    },
  },
} as const;

export type ThemeConfig = typeof THEME;