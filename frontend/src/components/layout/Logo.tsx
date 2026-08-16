"use client";

import Image from "next/image";
import { useTheme } from "next-themes";

import { useMounted } from "@/hooks/useMounted";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type LogoVariant = "auto" | "horizontal" | "vertical" | "icon";

interface LogoProps {
  variant?: LogoVariant;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
}

export default function Logo({
  variant = "auto",
  width,
  height,
  priority = false,
  className,
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const isDark = mounted && resolvedTheme === "dark";

  const horizontalLogo = isDark
    ? "/logos/logo-horizontal-dark.svg"
    : "/logos/logo-horizontal-light.svg";

  const verticalLogo = isDark
    ? "/logos/logo-vertical-dark.svg"
    : "/logos/logo-vertical-light.svg";

  const iconLogo = isDark
    ? "/logos/logo-icon-dark.svg"
    : "/logos/logo-icon-light.svg";

  let logo = horizontalLogo;

  switch (variant) {
    case "vertical":
      logo = verticalLogo;
      break;
    case "icon":
      logo = iconLogo;
      break;
    default:
      logo = horizontalLogo;
      break;
  }

  const dimensions = {
    horizontal: {
      width: width ?? 95,
      height: height ?? 30,
    },
    vertical: {
      width: width ?? 155,
      height: height ?? 175,
    },
    icon: {
      width: width ?? 37,
      height: height ?? 37,
    },
  };

  if (variant === "auto") {
    return (
      <Link href="/" aria-label="Retour a l'accueil de SanteProx" className={cn("inline-flex items-center shrink-0", className)}>
        <Image
          src={horizontalLogo}
          alt="Logo SanteProx"
          width={100}
          height={35}
          priority={priority}
          className="hidden h-auto w-auto max-w-[190px] max-h-[130px] md:block"
        />
        <Image
          src={iconLogo}
          alt="Logo SanteProx"
          width={40}
          height={40}
          priority={priority}
          className="block h-auto w-auto max-w-[50px] max-h-[50px] md:hidden"
        />
      </Link>
    );
  }

  return (
    <Link href="/" aria-label="Retour a l'accueil de SanteProx" className={cn("inline-flex items-center shrink-0", className)}>
      <Image
        src={logo}
        alt="Logo SanteProx"
        width={dimensions[variant].width}
        height={dimensions[variant].height}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="h-auto w-auto object-contain"
        style={{
          maxWidth: `${dimensions[variant].width}px`,
          maxHeight: `${dimensions[variant].height}px`,
        }}
      />
    </Link>
  );
}
