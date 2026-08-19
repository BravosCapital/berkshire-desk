import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_INSURANCE_MULTIPLE,
  DEFAULT_MULTIPLE,
  SEGMENT_DEFAULTS,
} from "@/lib/valuation/quarterly";
import type { OpsMode, SegmentMultiples } from "@/lib/valuation/compute";

export type Theme = "dark" | "light";

type TrackerState = {
  multiple: number;
  setMultiple: (n: number) => void;
  insuranceMultiple: number;
  setInsuranceMultiple: (n: number) => void;
  mode: OpsMode;
  setMode: (m: OpsMode) => void;
  segment: SegmentMultiples;
  setSegment: (key: keyof SegmentMultiples, value: number) => void;
  methodologyOpen: boolean;
  setMethodologyOpen: (open: boolean) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
};

export const useTrackerStore = create<TrackerState>()(
  persist(
    (set) => ({
      multiple: DEFAULT_MULTIPLE,
      setMultiple: (n) => set({ multiple: n }),
      insuranceMultiple: DEFAULT_INSURANCE_MULTIPLE,
      setInsuranceMultiple: (n) => set({ insuranceMultiple: n }),
      mode: "blended",
      setMode: (mode) => set({ mode }),
      segment: { ...SEGMENT_DEFAULTS },
      setSegment: (key, value) =>
        set((s) => ({ segment: { ...s.segment, [key]: value } })),
      methodologyOpen: false,
      setMethodologyOpen: (methodologyOpen) => set({ methodologyOpen }),
      theme: "dark" as Theme,
      setTheme: (theme) => {
        try {
          localStorage.setItem("brk-theme", theme);
        } catch {
          /* ignore */
        }
        set({ theme });
      },
      toggleTheme: () =>
        set((s) => {
          const theme: Theme = s.theme === "dark" ? "light" : "dark";
          try {
            localStorage.setItem("brk-theme", theme);
          } catch {
            /* ignore */
          }
          return { theme };
        }),
    }),
    {
      name: "brk-desk-multiples",
      skipHydration: true,
      partialize: (s) => ({
        multiple: s.multiple,
        insuranceMultiple: s.insuranceMultiple,
        mode: s.mode,
        segment: s.segment,
      }),
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<TrackerState>;
        return {
          ...current,
          ...p,
          segment: { ...SEGMENT_DEFAULTS, ...p.segment },
        };
      },
    },
  ),
);
