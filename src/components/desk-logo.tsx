/** Compact monogram mark used in the header and brand lockup. */
export function DeskLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" fill="var(--color-surface-2)" />
      <rect
        x="0.75"
        y="0.75"
        width="30.5"
        height="30.5"
        rx="6.25"
        fill="none"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      <path
        fill="var(--color-fg)"
        fillRule="evenodd"
        d="M9 7h8.2c2.95 0 4.85 1.55 4.85 3.95 0 1.7-1.05 2.9-2.85 3.25 2.35.35 4 1.95 4 4.55 0 2.75-2.25 3.85-6.15 3.85H9V21.4h1.55V8.55H9V7zm4.15 1.85v4.1h4.15c1.4 0 2.15-.75 2.15-1.95s-.75-2.15-2.15-2.15h-4.15zm0 6.85v5.35h4.85c1.7 0 2.65-1 2.65-2.65s-.95-2.7-2.65-2.7h-4.85z"
      />
    </svg>
  );
}
