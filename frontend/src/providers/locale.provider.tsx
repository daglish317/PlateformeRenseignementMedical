"use client";

import { NextIntlClientProvider } from "next-intl";

type LocaleProviderProps = {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, unknown>;
};

export default function LocaleProvider({
  children,
  locale,
  messages,
}: LocaleProviderProps) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
    >
      {children}
    </NextIntlClientProvider>
  );
}