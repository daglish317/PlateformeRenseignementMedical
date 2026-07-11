import HeaderActions from "./HeaderActions";
import HeaderLogo from "./HeaderLogo";

import { SearchBar } from "@/components/common/search";


export default function HeaderMenu() {
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

      {/* Logo */}
      <HeaderLogo />


      {/* Recherche principale */}
      <div
        className="
          flex-1
          max-w-3xl
        "
      >
        <SearchBar />
      </div>


      {/* Actions utilisateur */}
      <HeaderActions />

    </div>
  );
}