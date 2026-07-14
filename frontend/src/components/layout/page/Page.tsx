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
        "flex h-full min-h-0 flex-1 flex-col overflow-hidden",
        className
      )}
    >
      {children}
    </main>
  );
}