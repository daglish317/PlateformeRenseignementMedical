import Logo from "@/components/layout/Logo";

type HeaderLogoProps = {
  asLink?: boolean;
};

export default function HeaderLogo({ asLink = true }: HeaderLogoProps) {
  return (
    <Logo
      variant="auto"
      priority
      className="shrink-0"
      asLink={asLink}
    />
  );
}
