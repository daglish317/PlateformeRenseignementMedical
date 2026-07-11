import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ThemeToggle from "@/components/layout/ThemeToggle";
import AuthButton from "@/components/layout/AuthButton";

export default function HeaderActions() {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        shrink-0
      "
    >
      <LanguageSwitcher />

      <ThemeToggle />

      <AuthButton />
    </div>
  );
}