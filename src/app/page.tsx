"use client";

import {
  addDays,
  addMonths,
  endOfISOWeek,
  endOfMonth,
  format,
  isSameMonth,
  parseISO,
  startOfISOWeek,
  startOfMonth,
  subDays,
} from "date-fns";
import { nl } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { OccRow } from "@/components/OccRow";
import { ProgressRing } from "@/components/ProgressRing";
import { TaskSheet } from "@/components/TaskSheet";
import { buildOccurrences, toISO } from "@/lib/recurrence";
import { useKasteel } from "@/lib/store";
import type { Occurrence } from "@/lib/types";

type View = "agenda" | "lijst";

export default function AgendaPage() {
  const { tasks, categories, completionMap, loading } = useKasteel();
  const today = useMemo(() => new Date(), []);
  const todayISO = toISO(today);

  const [view, setView] = useState<View>("agenda");
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(todayISO);
  const [openOcc, setOpenOcc] = useState<Occurrence | null>(null);
  const [showDone, setShowDone] = useState(true);

  const gridStart = startOfISOWeek(startOfMonth(month));
  const gridEnd = endOfISOWeek(endOfMonth(month));

  const monthOcc = useMemo(
    () => buildOccurrences(tasks, categories, completionMap, gridStart, gridEnd),
    [tasks, categories, completionMap, gridStart, gridEnd],
  );
  const byDay = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of monthOcc) map.set(o.date, [...(map.get(o.date) ?? []), o]);
    return map;
  }, [monthOcc]);

  const weekOcc = useMemo(
    () => buildOccurrences(tasks, categories, completionMap, startOfISOWeek(today), endOfISOWeek(today)),
    [tasks, categories, completionMap, today],
  );
  const todayOcc = weekOcc.filter((o) => o.date === todayISO);
  const todayDone = todayOcc.filter((o) => o.completion).length;
  const weekDone = weekOcc.filter((o) => o.completion).length;

  const listOcc = useMemo(
    () => buildOccurrences(tasks, categories, completionMap, subDays(today, 14), addDays(today, 30)),
    [tasks, categories, completionMap, today],
  );
  const overdue = listOcc.filter((o) => o.date < todayISO && !o.completion);
  const upcoming = listOcc.filter((o) => o.date >= todayISO && (showDone || !o.completion));
  const upcomingByDay = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of upcoming) map.set(o.date, [...(map.get(o.date) ?? []), o]);
    return [...map.entries()];
  }, [upcoming]);

  const selectedOcc = byDay.get(selected) ?? [];
  // houdt het geopende blad in sync na afvinken
  const liveOpen = openOcc ? (monthOcc.concat(listOcc).find((o) => o.key === openOcc.key) ?? openOcc) : null;

  const weekdayHeads = ["ma", "di", "wo", "do", "vr", "za", "zo"];
  const days: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  return (
    <div>
      {/* Hero */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-[2.2rem] bg-sun p-7 sm:p-10">
          <p className="text-sm font-semibold tracking-wide uppercase">
            {format(today, "EEEE d MMMM", { locale: nl })}
          </p>
          <h1 className="mt-3 text-5xl leading-[0.95] font-bold tracking-tight break-words sm:text-7xl">
            Huishouden
            <br />
            in ons <span className="serif-italic text-[2.9rem] sm:text-8xl">Kasteeltje</span>
          </h1>
          <p className="mt-5 max-w-md text-base/relaxed">
            {todayOcc.length === 0
              ? "Niets gepland voor vandaag. Geniet van het kasteel."
              : todayDone === todayOcc.length
                ? "Alles van vandaag is gedaan. Het kasteel glimt!"
                : `Nog ${todayOcc.length - todayDone} ${todayOcc.length - todayDone === 1 ? "taak" : "taken"} te gaan vandaag.`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col justify-between rounded-[2.2rem] bg-peri p-6">
            <p className="text-sm font-semibold">Vandaag</p>
            <ProgressRing done={todayDone} total={todayOcc.length} />
          </div>
          <div className="flex flex-col justify-between rounded-[2.2rem] bg-rose p-6">
            <p className="text-sm font-semibold">Deze week</p>
            <ProgressRing done={weekDone} total={weekOcc.length} />
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" aria-label="Weergave" className="relative flex rounded-full bg-paper p-1.5 ring-1 ring-ink/10">
          {(
            [
              ["agenda", "Agenda", CalendarDays],
              ["lijst", "Lijst", List],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={view === id}
              onClick={() => setView(id)}
              className="relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              {view === id && (
                <motion.span
                  layoutId="view-pill"
                  className="absolute inset-0 rounded-full bg-ink"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className={`relative flex items-center gap-2 ${view === id ? "text-cream" : ""}`}>
                <Icon size={16} aria-hidden="true" />
                {label}
              </span>
            </button>
          ))}
        </div>

        {view === "agenda" ? (
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <button
              type="button"
              aria-label="Vorige maand"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="grid h-11 w-11 place-items-center rounded-full bg-paper ring-1 ring-ink/10 hover:bg-white"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <AnimatePresence mode="wait">
              <motion.h2
                key={format(month, "yyyy-MM")}
                className="min-w-0 flex-1 text-center text-xl font-bold whitespace-nowrap capitalize sm:min-w-40 sm:flex-none sm:text-2xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18 }}
                aria-live="polite"
              >
                {format(month, "MMMM yyyy", { locale: nl })}
              </motion.h2>
            </AnimatePresence>
            <button
              type="button"
              aria-label="Volgende maand"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="grid h-11 w-11 place-items-center rounded-full bg-paper ring-1 ring-ink/10 hover:bg-white"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMonth(startOfMonth(new Date()));
                setSelected(todayISO);
              }}
              className="rounded-full bg-ink px-4 py-3 text-sm font-semibold text-cream sm:ml-1 sm:px-5"
            >
              Vandaag
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              checked={showDone}
              onChange={(e) => setShowDone(e.target.checked)}
              className="h-5 w-5 accent-black"
            />
            Toon gedane taken
          </label>
        )}
      </section>

      {loading && tasks.length === 0 && (
        <p role="status" className="mt-10 text-center text-sm opacity-70">
          Kasteel wordt geladen…
        </p>
      )}

      <AnimatePresence mode="wait">
        {view === "agenda" ? (
          <motion.section
            key="agenda"
            className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            <div className="rounded-[2.2rem] bg-paper p-3 ring-1 ring-ink/10 sm:p-5">
              <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] pb-2 text-center text-xs font-semibold tracking-wide uppercase opacity-60">
                {weekdayHeads.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1 sm:gap-1.5" role="grid" aria-label="Agenda">
                {days.map((d) => {
                  const iso = toISO(d);
                  const list = byDay.get(iso) ?? [];
                  const inMonth = isSameMonth(d, month);
                  const isToday = iso === todayISO;
                  const isSel = iso === selected;
                  const doneCount = list.filter((o) => o.completion).length;
                  return (
                    <button
                      key={iso}
                      type="button"
                      role="gridcell"
                      aria-selected={isSel}
                      aria-label={`${format(d, "EEEE d MMMM", { locale: nl })}, ${list.length} ${list.length === 1 ? "taak" : "taken"}, ${doneCount} gedaan`}
                      onClick={() => setSelected(iso)}
                      className={`relative flex h-14 min-w-0 flex-col items-center justify-between overflow-hidden rounded-2xl p-1 text-sm transition-colors sm:h-auto sm:min-h-24 sm:items-stretch sm:p-2 ${
                        isSel ? "bg-ink text-cream" : "bg-cream hover:bg-sun/50"
                      } ${inMonth ? "" : "opacity-35"}`}
                    >
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full text-sm font-bold ${
                          isToday && !isSel ? "bg-coral text-ink" : isToday ? "bg-coral text-ink" : ""
                        }`}
                      >
                        {format(d, "d")}
                      </span>
                      <span className="flex flex-wrap justify-center gap-1 sm:justify-start">
                        {list.slice(0, 4).map((o) => (
                          <span
                            key={o.key}
                            className="h-2.5 w-2.5 rounded-full ring-1 ring-ink/30"
                            style={{ background: o.completion ? "transparent" : (o.category?.color ?? "#F9DB6D") }}
                          />
                        ))}
                        {list.length > 4 && <span className="text-[10px] leading-none font-bold">+{list.length - 4}</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold capitalize">
                {format(parseISO(selected), "EEEE d MMMM", { locale: nl })}
              </h3>
              <ul className="mt-4 space-y-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {selectedOcc.map((o) => (
                    <OccRow key={o.key} occ={o} onOpen={setOpenOcc} overdue={o.date < todayISO} />
                  ))}
                </AnimatePresence>
              </ul>
              {selectedOcc.length === 0 && (
                <p className="serif-italic mt-4 text-2xl opacity-70">Een rustige dag.</p>
              )}
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="lijst"
            className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
          >
            {overdue.length > 0 && (
              <div className="lg:col-span-2">
                <h3 className="text-xl font-bold">
                  Achterstallig <span className="serif-italic text-2xl">({overdue.length})</span>
                </h3>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {overdue.map((o) => (
                    <OccRow key={o.key} occ={o} onOpen={setOpenOcc} overdue />
                  ))}
                </ul>
              </div>
            )}
            {upcomingByDay.map(([iso, list]) => (
              <div key={iso}>
                <h3 className="text-xl font-bold capitalize">
                  {iso === todayISO ? "Vandaag" : format(parseISO(iso), "EEEE d MMMM", { locale: nl })}
                </h3>
                <ul className="mt-3 space-y-3">
                  {list.map((o) => (
                    <OccRow key={o.key} occ={o} onOpen={setOpenOcc} />
                  ))}
                </ul>
              </div>
            ))}
            {upcomingByDay.length === 0 && overdue.length === 0 && (
              <p className="serif-italic text-2xl opacity-70 lg:col-span-2">
                Niets gepland de komende 30 dagen.
              </p>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <TaskSheet occ={liveOpen} onClose={() => setOpenOcc(null)} />
    </div>
  );
}
