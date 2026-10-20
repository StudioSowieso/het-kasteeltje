"use client";

import { motion } from "motion/react";
import { useMemo } from "react";

/** Gescalloped "bloem"-vorm zoals in het design: een cirkel met golvende rand. */
export function Scallop({
  color,
  size = 120,
  lobes = 10,
  depth = 0.07,
  spin = false,
  className,
}: {
  color: string;
  size?: number;
  lobes?: number;
  depth?: number;
  spin?: boolean;
  className?: string;
}) {
  const d = useMemo(() => {
    const pts: string[] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const r = 46 * (1 + depth * Math.sin(a * lobes));
      pts.push(`${i === 0 ? "M" : "L"}${(50 + r * Math.cos(a)).toFixed(2)} ${(50 + r * Math.sin(a)).toFixed(2)}`);
    }
    return `${pts.join(" ")}Z`;
  }, [lobes, depth]);

  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      animate={spin ? { rotate: 360 } : undefined}
      transition={spin ? { duration: 40, repeat: Number.POSITIVE_INFINITY, ease: "linear" } : undefined}
    >
      <path d={d} fill={color} />
    </motion.svg>
  );
}
