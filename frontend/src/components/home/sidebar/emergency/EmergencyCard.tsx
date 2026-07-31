"use client";

import { cn } from "@/lib/utils";
import type { EmergencyItem } from "@/constants/emergency";

type EmergencyCardProps = {
  emergency: EmergencyItem;
  selected?: boolean;
  onClick?: (id: EmergencyItem["id"]) => void;
};

export default function EmergencyCard({
  emergency,
  selected = false,
  onClick,
}: EmergencyCardProps) {
  const Icon = emergency.icon;

  return (
  <div className="bg-red-600 text-white p-4 rounded-xl">
    TEST EMERGENCY CARD
  </div>
);
}