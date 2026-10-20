"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { CategoryIcon } from "./icons";
import { useKasteel } from "@/lib/store";
import type { Occurrence } from "@/lib/types";

export function OccRow({
  occ,
  onOpen,
  overdue = false,
}: {
  occ: Occurrence;
  onOpen: (o: Occurrence) => void;
  overdue?: boolean;
}) {
  const { members } = useKasteel();
  const done = !!occ.completion;
  const who = members.find((m) => m.id === occ.completion?.done_by);
  const color = occ.category?.color ?? "#F9DB6D";

  return (
    <motion.li layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <button
        type="button"
        onClick={() => onOpen(occ)}
        className="group flex w-full items-center gap-4 rounded-[1.6rem] p-3 pr-5 text-left transition-transform hover:-translate-y-0.5 active:scale-[0.99]"
        style={{ background: done ? "rgba(255,250,240,0.7)" : color }}
      >
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-ink transition-colors"
          style={{ background: done ? "#14110f" : "rgba(255,250,240,0.55)", color: done ? "#fbf3e2" : "#14110f" }}
        >
          {done ? <Check size={22} strokeWidth={3} aria-hidden="true" /> : <CategoryIcon name={occ.category?.icon ?? "sparkles"} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-base font-semibold ${done ? "line-through opacity-60" : ""}`}>
            {occ.task.title}
          </span>
          <span className="block truncate text-sm opacity-70">
            {occ.category?.name}
            {overdue && !done ? " · te laat" : ""}
          </span>
        </span>
        {who ? (
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg ring-2 ring-ink/20"
            style={{ background: who.color }}
            title={`Gedaan door ${who.name}`}
          >
            <span aria-hidden="true">{who.emoji}</span>
            <span className="sr-only">Gedaan door {who.name}</span>
          </span>
        ) : (
          !done && (
            <span className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-cream opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Afvinken
            </span>
          )
        )}
      </button>
    </motion.li>
  );
}
