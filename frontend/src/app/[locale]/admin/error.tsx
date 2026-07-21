"use client";

import { useEffect } from "react";
import { AdminError } from "@/features/admin/shared/components/AdminError";

export default function AdminErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AdminError
      message={error.message || "Une erreur est survenue dans le dashboard."}
      onRetry={reset}
    />
  );
}
