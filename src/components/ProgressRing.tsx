"use client";

import { motion } from "motion/react";

export function ProgressRing({
  done,
  total,
  size = 112,
  track = "rgba(20,17,15,0.15)",
  bar = "#14110f",
}: {
  done: number;
  total: number;
  size?: number;
  track?: string;
  bar?: string;
}) {
  const pct = total === 0 ? 0 : done / total;
  const r = 42;
  const c = 2 * Math.PI * r;
  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${done} van ${total} gedaan`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx="50" cy="50" r={r} fill="none" stroke={track} strokeWidth="9" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={bar}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <span className="text-2xl font-bold tabular-nums">
          {done}
          <span className="text-base font-medium opacity-60">/{total}</span>
        </span>
      </div>
    </div>
  );
}
