"use client";

import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { Check, RotateCcw, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CategoryIcon } from "./icons";
import { Modal } from "./Modal";
import { recurrenceText } from "@/lib/recurrence";
import { useKasteel } from "@/lib/store";
import type { Occurrence } from "@/lib/types";

const LAST_KEY = "kt-last-member";
const CONFETTI = ["#F9DB6D", "#F4B8DC", "#A8BC82", "#B8C4F0", "#F28B82", "#A9DDD3"];

function Burst() {
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
      {Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        return (
          <motion.span
            key={i}
            className="absolute h-3 w-3 rounded-full"
            style={{ background: CONFETTI[i % CONFETTI.length] }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: Math.cos(angle) * 150, y: Math.sin(angle) * 150, scale: [0, 1.2, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        );
      })}
    </div>
  );
}

export function TaskSheet({ occ, onClose }: { occ: Occurrence | null; onClose: () => void }) {
  const { members, complete, undo } = useKasteel();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [burst, setBurst] = useState(0);

  useEffect(() => {
    if (!occ) return;
    let last: string | null = null;
    try {
      last = localStorage.getItem(LAST_KEY);
    } catch {}
    const valid = members.find((m) => m.id === last)?.id ?? members[0]?.id ?? null;
    setMemberId(occ.completion?.done_by ?? valid);
  }, [occ, members]);

  const done = !!occ?.completion;
  const who = members.find((m) => m.id === occ?.completion?.done_by);
  const color = occ?.category?.color ?? "#F9DB6D";

  async function onComplete() {
    if (!occ) return;
    setBusy(true);
    try {
      if (memberId) localStorage.setItem(LAST_KEY, memberId);
    } catch {}
    await complete(occ.task.id, occ.date, memberId);
    setBusy(false);
    setBurst((b) => b + 1);
    window.setTimeout(onClose, 850);
  }

  async function onUndo() {
    if (!occ?.completion) return;
    setBusy(true);
    await undo(occ.completion);
    setBusy(false);
    onClose();
  }

  return (
    <Modal open={!!occ} onClose={onClose} title={occ?.task.title ?? "Taak"} background={color}>
      {occ && (
        <div className="relative">
          <AnimatePresence>{burst > 0 && <Burst key={burst} />}</AnimatePresence>

          <div className="flex items-start justify-between gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-paper/60">
              <CategoryIcon name={occ.category?.icon ?? "sparkles"} size={26} />
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Sluiten"
              className="grid h-11 w-11 place-items-center rounded-full bg-paper/70 hover:bg-paper"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <p className="mt-5 text-sm font-semibold tracking-wide uppercase opacity-70">{occ.category?.name}</p>
          <h2 className="mt-1 text-3xl leading-tight font-bold tracking-tight">{occ.task.title}</h2>
          <p className="serif-italic mt-2 text-xl">{format(parseISO(occ.date), "EEEE d MMMM", { locale: nl })}</p>
          <p className="mt-1 text-sm opacity-70">{recurrenceText(occ.task)}</p>
          {occ.task.notes && <p className="mt-4 rounded-2xl bg-paper/60 p-4 text-sm/relaxed">{occ.task.notes}</p>}

          {done ? (
            <div className="mt-6">
              <div className="flex items-center gap-3 rounded-2xl bg-paper/70 p-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-cream">
                  <Check size={20} strokeWidth={3} aria-hidden="true" />
                </span>
                <p className="text-base font-semibold">
                  Gedaan{who ? ` door ${who.emoji} ${who.name}` : ""}
                  <span className="block text-sm font-normal opacity-70">
                    {format(parseISO(occ.completion!.done_at), "EEEE d MMM 'om' HH:mm", { locale: nl })}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={onUndo}
                disabled={busy}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-semibold ring-1 ring-ink/20 hover:bg-white disabled:opacity-60"
              >
                <RotateCcw size={16} aria-hidden="true" />
                Ongedaan maken
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <fieldset>
                <legend className="text-sm font-semibold">Wie heeft dit opgelost?</legend>
                {members.length === 0 ? (
                  <p className="mt-2 text-sm">
                    Er zijn nog geen huisgenoten.{" "}
                    <Link href="/huisgenoten" onClick={onClose} className="font-semibold underline">
                      Voeg er eerst een toe
                    </Link>
                    .
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {members.map((m) => {
                      const on = memberId === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          aria-pressed={on}
                          onClick={() => setMemberId(m.id)}
                          className={`flex items-center gap-2 rounded-full py-2 pr-4 pl-2 text-sm font-semibold transition-all ${
                            on ? "bg-ink text-cream" : "bg-paper/70 hover:bg-paper"
                          }`}
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-full text-base" style={{ background: m.color }}>
                            <span aria-hidden="true">{m.emoji}</span>
                          </span>
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </fieldset>

              <motion.button
                type="button"
                onClick={onComplete}
                disabled={busy || (members.length > 0 && !memberId)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-lg font-semibold text-cream disabled:opacity-50"
              >
                <Check size={22} strokeWidth={3} aria-hidden="true" />
                Afvinken
              </motion.button>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
