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
      <Link
        href="/"
        aria-label="Retour à l'accueil de SantéProx"
        className={cn("inline-flex items-center shrink-0", className)}
      >
        {/* Desktop - Visible et élégant */}
        <Image
          src={horizontalLogo}
          alt="Logo SantéProx"
          width={100}
          height={35}
          priority={priority}
          className="hidden max-w-[190px] max-h-[130px] h-auto w-auto md:block"
        />

        {/* Mobile - Visible sans être imposant */}
        <Image
          src={iconLogo}
          alt="Logo SantéProx"
          width={40}
          height={40}
          priority={priority}
          className="block max-w-[50px] max-h-[50px] h-auto w-auto md:hidden"
        />
      </Link>
    );
  }

  return (
    <Link
      href="/"
      aria-label="Retour à l'accueil de SantéProx"
      className={cn("inline-flex items-center shrink-0", className)}
    >
      <Image
        src={logo}
        alt="Logo SantéProx"
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
