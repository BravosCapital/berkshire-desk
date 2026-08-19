import { useEffect, useRef, useState } from "react";

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useAnimatedNumber(target: number, duration = 400) {
  const [value, setValue] = useState(target);
  const currentRef = useRef(target);

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !Number.isFinite(target)) {
      currentRef.current = target;
      setValue(target);
      return;
    }
    const from = currentRef.current;
    const delta = target - from;
    if (Math.abs(delta) < 1e-9) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const next = from + delta * easeOut(p);
      currentRef.current = next;
      setValue(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return value;
}

export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
}) {
  const animated = useAnimatedNumber(value);
  return <span className={className}>{format(animated)}</span>;
}
