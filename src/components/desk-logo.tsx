/** Compact monogram mark used in the header and brand lockup. */
export function DeskLogo({ className = "size-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="0.5"
        y="0.5"
        width="31"
        height="31"
        rx="7"
        fill="var(--color-surface-2)"
        stroke="var(--color-border-strong)"
        strokeWidth="1"
      />
      <path
        fill="var(--color-fg)"
        fillRule="evenodd"
        d="M7.2 7.2H18.2c3.4 0 5.4 1.85 5.4 4.55 0 2-1.35 3.25-3.45 3.7 2.7.4 4.65 2.3 4.65 5.45 0 3.2-2.7 4.1-7.15 4.1H7.2v-1.7h1.6V8.9H7.2V7.2zm5.2 2.05v4.4h4.65c1.55 0 2.4-.85 2.4-2.2s-.85-2.2-2.4-2.2H12.4zm0 7.5v5.85h5.45c1.9 0 2.95-1.15 2.95-2.95s-1.05-2.9-2.95-2.9H12.4z"
      />
    </svg>
  );
}
