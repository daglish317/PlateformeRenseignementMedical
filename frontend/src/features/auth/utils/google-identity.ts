"use client";

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonOptions = {
  type?: "standard";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
};

type GoogleIdentityApi = {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    itp_support?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options?: GoogleButtonOptions) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityApi;
      };
    };
    __googleIdentityScriptPromise?: Promise<void>;
    __googleIdentityInitializedClientId?: string;
    __googleIdentityCredentialCallback?: (response: GoogleCredentialResponse) => void;
  }
}

export {};

const GOOGLE_SCRIPT_ID = "google-identity-services-script";

export function getGoogleIdentityApi(): GoogleIdentityApi | null {
  return window.google?.accounts?.id ?? null;
}

export function loadGoogleIdentityScript(locale: string): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity Services requires a browser environment."));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (window.__googleIdentityScriptPromise) {
    return window.__googleIdentityScriptPromise;
  }

  window.__googleIdentityScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    const finalizeError = (error: Error) => {
      window.__googleIdentityScriptPromise = undefined;
      reject(error);
    };

    const handleLoad = () => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }

      finalizeError(new Error("Google Identity Services failed to initialize."));
    };

    const handleError = () => {
      finalizeError(new Error("Unable to load the Google Identity Services script."));
    };

    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = `https://accounts.google.com/gsi/client?hl=${encodeURIComponent(locale)}`;
    script.async = true;
    script.defer = true;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.head.appendChild(script);
  });

  return window.__googleIdentityScriptPromise;
}

export function initializeGoogleIdentity(
  clientId: string,
  callback: (response: GoogleCredentialResponse) => void
): GoogleIdentityApi {
  const api = getGoogleIdentityApi();

  if (!api) {
    throw new Error("Google Identity Services API is unavailable.");
  }

  window.__googleIdentityCredentialCallback = callback;

  if (window.__googleIdentityInitializedClientId !== clientId) {
    api.initialize({
      client_id: clientId,
      callback: (response) => {
        window.__googleIdentityCredentialCallback?.(response);
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    window.__googleIdentityInitializedClientId = clientId;
  }

  return api;
}
