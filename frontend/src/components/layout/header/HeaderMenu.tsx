import HeaderLogo from "./HeaderLogo";
import HeaderSearch from "./HeaderSearch";
import HeaderActions from "./HeaderActions";

type HeaderMenuProps = {
  showSearch?: boolean;
};

export default function HeaderMenu({
  showSearch = true,
}: HeaderMenuProps) {
  return (
    <div
      className="
        flex
        w-full
        items-center
        gap-6
      "
    >
      <HeaderLogo />

      <HeaderSearch
        visible={showSearch}
      />

      <HeaderActions />
    </div>
  );
}