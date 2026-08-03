"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

import {
  ReactQueryDevtools,
} from "@tanstack/react-query-devtools";

import { useState } from "react";


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

      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
        />
      )}

    </QueryClientProvider>
  );
}