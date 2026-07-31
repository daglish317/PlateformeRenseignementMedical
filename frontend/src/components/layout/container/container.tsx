import { cn } from "@/lib/utils";

type ContainerSize = "sm" | "md" | "lg" | "xl" | "2xl";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: ContainerSize;
  fluid?: boolean;
};

const sizes: Record<ContainerSize, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-7xl",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
};

export default function Container({
  children,
  className,
  size = "lg",
  fluid = false,
}: ContainerProps) {
  return (
    <div
      className={cn(
  "w-full mx-auto",
  !fluid && "px-4 sm:px-6 lg:px-8",
  !fluid && sizes[size],
  fluid && "max-w-none",
  className
)}
    >
      {children}
    </div>
  );
}