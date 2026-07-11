"use client";

type SearchDropdownProps = {
  children: React.ReactNode;
};

export default function SearchDropdown({
  children,
}: SearchDropdownProps) {
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border bg-card shadow-xl">
      {children}
    </div>
  );
}