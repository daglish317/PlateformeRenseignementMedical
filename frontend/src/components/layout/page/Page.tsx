import { cn } from "@/lib/utils";

type PageProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Page({
  children,
  className,
}: PageProps) {
  return (
    <main
      className={cn(
        "flex min-h-screen flex-col",
        className
      )}
    >
      {children}
    </main>
  );
}