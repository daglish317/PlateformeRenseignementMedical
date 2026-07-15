import HeaderMenu from "./HeaderMenu";
import MobileMenu from "./MobileMenu";

type HeaderProps = {
  showSearch?: boolean;
};

export default function Header({
  showSearch = true,
}: HeaderProps) {
  return (
    <header
      className="
        sticky
        top-0
        z-40
        w-full
        border-b
        border-border
        bg-background/80
        backdrop-blur-xl
      "
    >
      <div
        className="
          mx-auto
          flex
          h-16
          w-full
          max-w-7xl
          items-center
          px-4
          sm:px-6
          lg:px-8
        "
      >
        <HeaderMenu
          showSearch={showSearch}
        />

        <MobileMenu
          showSearch={showSearch}
        />
      </div>
    </header>
  );
}