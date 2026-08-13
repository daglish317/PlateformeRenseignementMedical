"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import { useState } from "react";
import dynamic from "next/dynamic";

const ReactQueryDevtools =
  process.env.NODE_ENV === "development"
    ? dynamic(
        () =>
          import("@tanstack/react-query-devtools").then((mod) => mod.ReactQueryDevtools),
        { ssr: false }
      )
    : null;


type QueryProviderProps = {
  children: React.ReactNode;
};


export default function QueryProvider({
  children,
}: QueryProviderProps) {

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Augmenter drastiquement le staleTime
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache plus long
            gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
            // Réduire les retries
            retry: 1,
            // Refetch moins agressif
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );


  return (
    <QueryClientProvider client={queryClient}>
      {children}

      {ReactQueryDevtools && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}

    </QueryClientProvider>
  );
}
