export type HeaderVariant = "public";

export type HeaderAction =
  | "language"
  | "theme"
  | "auth";

export type HeaderProps = {
  variant?: HeaderVariant;
  className?: string;
};