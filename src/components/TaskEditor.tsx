"use client";

import { format } from "date-fns";
import { useEffect, useState, type FormEvent } from "react";
import { Modal } from "./Modal";
import { toISO, WEEKDAY_LABELS } from "@/lib/recurrence";
import { useKasteel } from "@/lib/store";
import type { Task, Unit } from "@/lib/types";

const UNITS: { value: Unit; one: string; many: string }[] = [
  { value: "day", one: "dag", many: "dagen" },
  { value: "week", one: "week", many: "weken" },
  { value: "month", one: "maand", many: "maanden" },
  { value: "year", one: "jaar", many: "jaar" },
];

const field =
  "mt-2 w-full rounded-2xl border-2 border-ink/80 bg-paper px-4 py-3 text-base outline-none focus:ring-4 focus:ring-ink/15";

export function TaskEditor({
  open,
  task,
  defaultCategoryId,
  onClose,
}: {
  open: boolean;
  task: Task | null;
  defaultCategoryId?: string;
  onClose: () => void;
}) {
  const { categories, saveTask, removeTask } = useKasteel();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [kind, setKind] = useState<"once" | "recurring">("recurring");
  const [onceDate, setOnceDate] = useState(toISO(new Date()));
  const [everyN, setEveryN] = useState(1);
  const [unit, setUnit] = useState<Unit>("week");
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState(toISO(new Date()));
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [active, setActive] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    const todayS = toISO(new Date());
    setTitle(task?.title ?? "");
    setCategoryId(task?.category_id ?? defaultCategoryId ?? categories[0]?.id ?? "");
    setKind(task?.kind ?? "recurring");
    setOnceDate(task?.once_date ?? todayS);
    setEveryN(task?.every_n ?? 1);
    setUnit(task?.unit ?? "week");
    setWeekdays(task?.weekdays ?? []);
    setStartDate(task?.start_date ?? todayS);
    setEndDate(task?.end_date ?? "");
    setNotes(task?.notes ?? "");
    setActive(task?.active ?? true);
    setConfirmDelete(false);
  }, [open, task, defaultCategoryId, categories]);

  function toggleDay(d: number) {
    setWeekdays((w) => (w.includes(d) ? w.filter((x) => x !== d) : [...w, d].sort((a, b) => a - b)));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;
    setBusy(true);
    await saveTask({
      id: task?.id,
      title: title.trim(),
      category_id: categoryId,
      notes: notes.trim() || null,
      kind,
      once_date: kind === "once" ? onceDate : null,
      every_n: Math.max(1, Math.min(365, everyN || 1)),
      unit,
      weekdays: kind === "recurring" && unit === "week" ? weekdays : [],
      start_date: kind === "recurring" ? startDate : (task?.start_date ?? toISO(new Date())),
      end_date: kind === "recurring" && endDate ? endDate : null,
      active,
    });
    setBusy(false);
    onClose();
  }

  async function del() {
    if (!task) return;
    setBusy(true);
    await removeTask(task.id);
    setBusy(false);
    onClose();
  }

  const unitLabel = UNITS.find((u) => u.value === unit);

  return (
    <Modal open={open} onClose={onClose} title={task ? "Taak bewerken" : "Nieuwe taak"}>
      <form onSubmit={submit}>
        <h2 className="text-3xl font-bold tracking-tight">
          {task ? "Taak " : "Nieuwe "}
          <span className="serif-italic text-4xl">{task ? "bewerken" : "taak"}</span>
        </h2>

        <label className="mt-6 block text-sm font-semibold">
          Naam
          <input
            className={field}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            required
            placeholder="bijv. Koelkast poetsen"
          />
        </label>

        <label className="mt-4 block text-sm font-semibold">
          Categorie
          <select className={field} value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <div role="radiogroup" aria-label="Soort taak" className="mt-5 grid grid-cols-2 gap-2 rounded-full bg-paper p-1.5">
          {(
            [
              ["recurring", "Terugkerend"],
              ["once", "Eenmalig"],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              role="radio"
              aria-checked={kind === v}
              onClick={() => setKind(v)}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                kind === v ? "bg-ink text-cream" : "hover:bg-cream"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {kind === "once" ? (
          <label className="mt-4 block text-sm font-semibold">
            Datum
            <input type="date" className={field} value={onceDate} onChange={(e) => setOnceDate(e.target.value)} required />
          </label>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <span className="text-sm font-semibold">Herhaal elke</span>
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={365}
                  aria-label="Aantal"
                  className="w-24 rounded-2xl border-2 border-ink/80 bg-paper px-4 py-3 text-base outline-none focus:ring-4 focus:ring-ink/15"
                  value={everyN}
                  onChange={(e) => setEveryN(Number(e.target.value))}
                />
                <select
                  aria-label="Eenheid"
                  className="flex-1 rounded-2xl border-2 border-ink/80 bg-paper px-4 py-3 text-base outline-none focus:ring-4 focus:ring-ink/15"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as Unit)}
                >
                  {UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {everyN === 1 ? u.one : u.many}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {unit === "week" && (
              <fieldset>
                <legend className="text-sm font-semibold">Op welke dagen?</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((label, i) => {
                    const d = i + 1;
                    const on = weekdays.includes(d);
                    return (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggleDay(d)}
                        className={`h-12 w-12 rounded-full text-sm font-bold uppercase transition-colors ${
                          on ? "bg-ink text-cream" : "bg-paper hover:bg-white"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs opacity-70">Niets gekozen? Dan wordt de weekdag van de startdatum gebruikt.</p>
              </fieldset>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold">
                Startdatum
                <input type="date" className={field} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </label>
              <label className="block text-sm font-semibold">
                Einddatum <span className="font-normal opacity-60">(optioneel)</span>
                <input
                  type="date"
                  className={field}
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </label>
            </div>
            <p className="text-xs opacity-70">
              Voorbeeld: elke {everyN === 1 ? unitLabel?.one : `${everyN} ${unitLabel?.many}`}, vanaf{" "}
              {startDate ? format(new Date(`${startDate}T00:00:00`), "d/M/yyyy") : "…"}.
            </p>
          </div>
        )}

        <label className="mt-4 block text-sm font-semibold">
          Notitie <span className="font-normal opacity-60">(optioneel)</span>
          <textarea className={field} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        {task && (
          <label className="mt-4 flex cursor-pointer items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              className="h-5 w-5 accent-black"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Actief in de agenda
          </label>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink px-8 py-3.5 text-base font-semibold text-cream disabled:opacity-60"
          >
            Opslaan
          </button>
          <button type="button" onClick={onClose} className="rounded-full px-5 py-3.5 text-base font-semibold hover:bg-paper">
            Annuleren
          </button>
          {task &&
            (confirmDelete ? (
              <button
                type="button"
                onClick={del}
                disabled={busy}
                className="ml-auto rounded-full bg-coral px-5 py-3.5 text-sm font-bold"
              >
                Zeker weten? Verwijderen
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto rounded-full px-5 py-3.5 text-sm font-semibold text-[#a3201a] hover:bg-paper"
              >
                Verwijderen
              </button>
            ))}
        </div>
      </form>
    </Modal>
  );
}
