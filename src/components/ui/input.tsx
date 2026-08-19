import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-sm bg-surface-2 px-3 text-sm text-fg shadow-[var(--shadow-border)] placeholder:text-faint transition-[box-shadow] duration-150 focus-visible:shadow-[var(--shadow-border-hover)] focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}
