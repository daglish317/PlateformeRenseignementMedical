import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  const currentLocale = hasLocale(routing.locales, locale)
    ? locale
    : routing.defaultLocale;

  return {
    timeZone: "Africa/Douala",
    locale: currentLocale,
    messages: (
      await import(`../messages/${currentLocale}.json`)
    ).default,
  };
});