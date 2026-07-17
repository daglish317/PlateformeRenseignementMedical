"use client";

import { Separator } from "@/components/ui/separator";

interface DividerProps {
  text?: string;
}

export function Divider({ text = "OU" }: DividerProps) {
  return (
    <div className="relative flex items-center gap-4 py-2">
      <Separator className="flex-1" />
      <span className="text-sm text-muted-foreground">{text}</span>
      <Separator className="flex-1" />
    </div>
  );
}
