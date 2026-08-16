/// <reference lib="webworker" />

import { Serwist, type PrecacheEntry } from "serwist";
import { defaultCache } from "@serwist/next/worker";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: PrecacheEntry[];
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  runtimeCaching: defaultCache,
  skipWaiting: true,
  clientsClaim: true,
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher: ({ request }) => request.mode === "navigate",
      },
    ],
  },
});

serwist.addEventListeners();

const DEFAULT_LOCALE = "fr";
const DEFAULT_CLICK_URL = "/owner/alertes";

function normalizeLocalePath(pathname: string, locale: string) {
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (/^\/(fr|en)\//.test(cleanPath)) {
    return cleanPath;
  }
  const cleanLocale = locale === "en" ? "en" : DEFAULT_LOCALE;
  return `/${cleanLocale}${cleanPath}`;
}

function getLocaleFromClients(clients: readonly WindowClient[]) {
  for (const client of clients) {
    const pathname = new URL(client.url).pathname;
    const match = pathname.match(/^\/(fr|en)\//);
    if (match) {
      return match[1];
    }
  }
  return DEFAULT_LOCALE;
}

function resolveClickUrl(payload: { click_url?: string; nav_item?: string }, locale: string) {
  if (payload.click_url) {
    return normalizeLocalePath(payload.click_url, locale);
  }

  const navItem = (payload.nav_item || "").toLowerCase();
  const mapping: Record<string, string> = {
    alertes: "/owner/alertes",
    messages: "/owner/chat",
    message: "/owner/chat",
    stock: "/owner/inventaires",
    inventaires: "/owner/inventaires",
    history: "/owner/history",
    historique: "/owner/history",
    caisse: "/owner/caisse",
    statistics: "/owner/statistics",
    statistiques: "/owner/statistics",
    profil: "/owner/profile",
    profile: "/owner/profile",
    team: "/owner/team",
    structures: "/owner/team",
    notifications: "/owner/alertes",
    settings: "/owner/settings",
    parametres: "/owner/settings",
  };

  return normalizeLocalePath(mapping[navItem] || DEFAULT_CLICK_URL, locale);
}

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  const title = payload.titre || "SanteProx";
  const options = {
    body: payload.message || "",
    tag: payload.id || title,
    renotify: true,
    data: {
      click_url: payload.click_url || DEFAULT_CLICK_URL,
      nav_item: payload.nav_item || "",
    },
  } as NotificationOptions & { renotify: boolean };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const locale = getLocaleFromClients(clients);
        const targetUrl = new URL(
          resolveClickUrl(
            (event.notification.data as { click_url?: string; nav_item?: string } | undefined) || {},
            locale
          ),
          self.location.origin
        ).toString();

        for (const client of clients) {
          if ("focus" in client && client.url === targetUrl) {
            return client.focus();
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return undefined;
      })
  );
});
