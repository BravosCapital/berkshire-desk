import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: ComponentProps<"span"> & {
  tone?: "neutral" | "gain" | "loss" | "warn";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-kicker font-medium uppercase",
        tone === "neutral" && "bg-surface-3 text-muted shadow-[var(--shadow-border)]",
        tone === "gain" && "bg-gain-dim text-gain",
        tone === "loss" && "bg-loss-dim text-loss",
        tone === "warn" && "bg-warn-dim text-warn",
        className,
      )}
      {...props}
    />
  );
}