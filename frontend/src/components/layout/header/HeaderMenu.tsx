import HeaderLogo from "./HeaderLogo";
import HeaderSearch from "./HeaderSearch";
import HeaderActions from "./HeaderActions";
import { Link } from "@/i18n/navigation";

type HeaderMenuProps = {
  showSearch?: boolean;
  showHomeLink?: boolean;
};

export default function HeaderMenu({
  showSearch = true,
  showHomeLink = false,
}: HeaderMenuProps) {
  return (
    <div
      className={`
        hidden
        w-full
        items-center

        lg:flex
        ${showSearch ? 'gap-1.5' : 'justify-between'}
      `}
    >
      <div className="flex items-center gap-3">
        <HeaderLogo asLink={!showHomeLink} />

        {showHomeLink && (
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Accueil
          </Link>
        )}
      </div>

      {showSearch && (
        <HeaderSearch
          visible={showSearch}
        />
      )}

      <HeaderActions showPublicLinks={showSearch} />
    </div>
  );
}
