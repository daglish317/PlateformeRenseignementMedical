"use client";

import Logo from "@/components/layout/Logo";

type AuthCardMode = "login" | "register" | "activation";

interface AuthCardProps {
  title: string;
  mode?: AuthCardMode;
  children: React.ReactNode;
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <section className="w-full">
      <div className="mx-auto min-h-[680px] max-w-md overflow-hidden rounded-lg border border-border/70 bg-card shadow-2xl">
        <div className="flex min-h-[680px] flex-col bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <Logo variant="horizontal" width={118} height={38} priority />
          </div>

          <div className="flex flex-1 items-center justify-center p-5 sm:p-8">
            <div className="w-full max-w-md">
              <div className="mb-7 space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                  {title}
                </h2>
              </div>

              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
