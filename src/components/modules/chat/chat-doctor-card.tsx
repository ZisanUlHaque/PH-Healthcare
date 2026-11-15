"use client";

import { cn } from "cn";
import { ArrowUpRight, Stethoscope, Wallet } from "lucide-react";
import Link from "next/link";
import type { ChatDoctor } from "@/types";

export default function ChatDoctorCard({
  doctor,
  onSelect,
}: {
  doctor: ChatDoctor;
  onSelect?: () => void;
}) {
  return (
    <Link
      href={`/doctors/${doctor.id}`}
      onClick={onSelect}
      className={cn(
        "bg-background flex items-center justify-between gap-3 rounded-xl border p-2.5",
        "hover:bg-accent transition-colors",
      )}
    >
      <div className="min-w-0 space-y-0.5">
        <p className="text-foreground truncate text-sm font-medium">
          {doctor.name}
        </p>
        <p className="text-muted-foreground flex items-center gap-1 text-xs">
          <Stethoscope className="size-3 shrink-0" />
          {doctor.specialization}
        </p>
        {doctor.consultationFee != null && (
          <p className="text-muted-foreground flex items-center gap-1 text-xs">
            <Wallet className="size-3 shrink-0" />৳{doctor.consultationFee}
          </p>
        )}
      </div>
      <ArrowUpRight className="text-muted-foreground size-4 shrink-0" />
    </Link>
  );
}
