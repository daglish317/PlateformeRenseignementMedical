import { SearchBar } from "@/components/common/search";

type HeaderSearchProps = {
  visible?: boolean;
};

export default function HeaderSearch({
  visible = true,
}: HeaderSearchProps) {
  if (!visible) {
    return null;
  }

  return (
    <div
      className="
        flex-1
        max-w-3xl
      "
    >
      <SearchBar />
    </div>
  );
}