import { cn } from "@/lib/utils";

type SectionSpacing = "none" | "sm" | "md" | "lg" | "xl";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  spacing?: SectionSpacing;
  as?: React.ElementType;
};

const spacingClasses: Record<SectionSpacing, string> = {
  none: "",
  sm: "py-10",
  md: "py-16",
  lg: "py-24",
  xl: "py-32",
};

export default function Section({
  children,
  className,
  spacing = "lg",
  as: Component = "section",
}: SectionProps) {
  return (
    <Component
      className={cn(
        "flex min-h-0 flex-col",
        spacingClasses[spacing],
        className
      )}
    >
      {children}
    </Component>
  );
}