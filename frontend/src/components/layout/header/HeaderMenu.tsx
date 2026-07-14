import HeaderActions from "./HeaderActions";
import HeaderLogo from "./HeaderLogo";
import HeaderSearch from "./HeaderSearch";

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
        lg:flex
        w-full
        items-center
        gap-6
      "
    >
      <HeaderLogo />

      <HeaderSearch visible={showSearch} />

      <HeaderActions />
    </div>
  );
}