"use client";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh overflow-y-auto bg-[linear-gradient(135deg,oklch(0.96_0.018_220)_0%,oklch(0.98_0.012_150)_44%,oklch(0.94_0.018_245)_100%)] dark:bg-[linear-gradient(135deg,oklch(0.18_0.02_250)_0%,oklch(0.20_0.025_210)_52%,oklch(0.17_0.02_250)_100%)]">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}
