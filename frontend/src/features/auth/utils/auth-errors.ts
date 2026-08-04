interface ErrorWithDetail {
  detail?: string;
}

interface AxiosErrorResponse {
  response?: { data?: ErrorWithDetail };
}

export const getAuthErrorMessage = (
  error: unknown,
  fallback = "Une erreur est survenue"
): string => {
  if (error && typeof error === "object" && "response" in (error as AxiosErrorResponse)) {
    const data = (error as AxiosErrorResponse).response?.data;
    if (data?.detail) return data.detail;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (
    error &&
    typeof error === "object" &&
    "detail" in (error as ErrorWithDetail) &&
    typeof (error as ErrorWithDetail).detail === "string"
  ) {
    return (error as ErrorWithDetail).detail ?? fallback;
  }
  return fallback;
};
