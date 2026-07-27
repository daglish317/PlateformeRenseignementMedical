"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

    case "horizontal":
    case "auto":
    default:
      logo = horizontalLogo;
      break;
  }

  const dimensions = {
    horizontal: {
      width: width ?? 180,
      height: height ?? 48,
    },
    vertical: {
      width: width ?? 150,
      height: height ?? 170,
    },
    icon: {
      width: width ?? 42,
      height: height ?? 42,
    },
  };

  if (variant === "auto") {
    return (
      <Link
        href="/"
        aria-label="Retour à l'accueil de SantéProx"
        className={cn("inline-flex items-center", className)}
      >
        {/* Desktop */}
        <Image
          src={horizontalLogo}
          alt="Logo SantéProx"
          width={180}
          height={48}
          priority={priority}
          className="hidden h-auto w-auto md:block"
        />

        {/* Mobile */}
        <Image
          src={iconLogo}
          alt="Logo SantéProx"
          width={42}
          height={42}
          priority={priority}
          className="block h-auto w-auto md:hidden"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Retour à l'accueil de SantéProx"
      className={cn("inline-flex items-center", className)}
    >
      <Image
        src={logo}
        alt="Logo SantéProx"
        width={dimensions[variant].width}
        height={dimensions[variant].height}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        className="h-auto w-auto"
      />
    </Link>
  );
}
