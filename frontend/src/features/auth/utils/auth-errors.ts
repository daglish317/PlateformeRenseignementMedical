interface ErrorWithDetail {
  detail?: string;
}

export const getAuthErrorMessage = (error: unknown): string => {
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
    return (error as ErrorWithDetail).detail;
  }
  return "Une erreur est survenue";
};
