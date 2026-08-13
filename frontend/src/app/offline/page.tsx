import Image from "next/image";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-950">
      <section className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Image
            src="/pwa/icon-192.png"
            alt="SanteProx"
            width={96}
            height={96}
            priority
          />
        </div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Mode hors connexion
        </p>
        <h1 className="mb-4 text-3xl font-semibold tracking-normal">
          SanteProx reste disponible
        </h1>
        <p className="mb-8 text-sm leading-6 text-slate-600">
          Votre connexion semble interrompue. Les pages deja consultees peuvent
          rester accessibles, mais les donnees medicales et les operations en
          temps reel seront synchronisees quand le reseau reviendra.
        </p>

        <Link
          href="/fr"
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800"
        >
          Revenir a l&apos;accueil
        </Link>
      </section>
    </main>
  );
}
