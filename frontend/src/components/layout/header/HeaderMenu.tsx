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
        hidden
        w-full
        items-center
        gap-3

        lg:flex
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