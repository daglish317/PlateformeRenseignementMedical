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
        z-[10000]
        w-full
        border-b
        border-border
        bg-background/85
        backdrop-blur-xl
        shadow-sm
      "
    >
      <div
        className="
          mx-auto
          flex
          h-14
          w-full
          max-w-7xl
          items-center
          gap-2
          px-3
          sm:px-4
          lg:px-6
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