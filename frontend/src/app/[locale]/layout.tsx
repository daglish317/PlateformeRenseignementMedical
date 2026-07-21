import { notFound } from "next/navigation";
import {
  getMessages,
  setRequestLocale,
} from "next-intl/server";

import AppProviders from "@/providers/app-providers";


const locales = [
  "fr",
  "en",
];


export function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}


type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
};


export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {

  const { locale } = await params;


  if (!locales.includes(locale)) {
    notFound();
  }


  setRequestLocale(locale);


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