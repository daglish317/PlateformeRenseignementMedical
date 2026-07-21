"use client";

interface UserAvatarProps {
  nom: string;
  className?: string;
}

const colors = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-pink-500",
  "bg-indigo-500",
];

function getColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function UserAvatar({ nom, className }: UserAvatarProps) {
  const letter = nom?.charAt(0).toUpperCase() || "?";
  const bgColor = getColor(nom);

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium text-white ${bgColor} ${className || ""}`}
    >
      {letter}
    </div>
  );
}
