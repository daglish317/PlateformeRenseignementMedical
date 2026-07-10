import { notFound } from "next/navigation";
import { getMessages } from "next-intl/server";

import AppProviders from "@/providers/app-providers";


type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};


const locales = ["fr", "en"];


export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {

  const { locale } = await params;


  if (!locales.includes(locale)) {
    notFound();
  }


  const messages = await getMessages();


  return (
    <AppProviders
      locale={locale}
      messages={messages}
    >
      {children}
    </AppProviders>
  );
}