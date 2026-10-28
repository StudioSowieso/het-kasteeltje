"use client";

import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { useKasteel } from "@/lib/store";

const LAST_KEY = "kt-last-member";

/** Algemene to-do's: taken zonder datum die "gewoon een keer" gedaan moeten worden. */
export function Todos() {
  const { todos, members, addTodo, completeTodo, undoTodo, removeTodo } = useKasteel();
  const [title, setTitle] = useState("");
  const [picking, setPicking] = useState<string | null>(null);
  const [showDone, setShowDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done).sort((a, b) => (b.done_at ?? "").localeCompare(a.done_at ?? ""));

  async function add(e: FormEvent) {
    e.preventDefault();
    const value = title.trim();
    if (!value) return;
    setBusy(true);
    await addTodo(value);
    setTitle("");
    setBusy(false);
  }

  async function finish(id: string, memberId: string | null) {
    try {
      if (memberId) localStorage.setItem(LAST_KEY, memberId);
    } catch {}
    setPicking(null);
    await completeTodo(id, memberId);
  }

  return (
    <section aria-labelledby="todos-title" className="mt-8 rounded-[2.2rem] bg-mint p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="todos-title" className="text-2xl font-bold tracking-tight sm:text-3xl">
            General <span className="serif-italic text-3xl sm:text-4xl">to-do&rsquo;s</span>
          </h2>
          <p className="mt-1 text-sm opacity-70">Dingen die een keer moeten gebeuren, zonder vaste dag.</p>
        </div>
        <span className="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-cream tabular-nums">
          {open.length} open
        </span>
      </div>

      <form onSubmit={add} className="mt-5 flex gap-2">
        <label className="sr-only" htmlFor="todo-title">
          Nieuwe to-do
        </label>
        <input
          id="todo-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="bijv. Lamp in de gang vervangen"
          className="min-w-0 flex-1 rounded-full border-2 border-ink/80 bg-paper px-5 py-3 text-base outline-none focus:ring-4 focus:ring-ink/15"
        />
        <motion.button
          type="submit"
          disabled={busy || !title.trim()}
          whileTap={{ scale: 0.94 }}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-cream disabled:opacity-50"
        >
          <Plus size={18} aria-hidden="true" />
          <span className="hidden sm:inline">Toevoegen</span>
          <span className="sr-only sm:hidden">Toevoegen</span>
        </motion.button>
      </form>

      <ul className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {open.map((t) => (
            <motion.li
              key={t.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 30 }}
              className="rounded-2xl bg-paper/80 p-2 pr-3"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label={`Afvinken: ${t.title}`}
                  aria-expanded={picking === t.id}
                  onClick={() => (members.length === 0 ? finish(t.id, null) : setPicking(picking === t.id ? null : t.id))}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-cream transition-colors hover:bg-sun"
                />
                <span className="min-w-0 flex-1 text-base font-semibold break-words">{t.title}</span>
                <button
                  type="button"
                  aria-label={`Verwijder: ${t.title}`}
                  onClick={() => removeTodo(t.id)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full opacity-60 hover:bg-cream hover:opacity-100"
                >
                  <Trash2 size={17} aria-hidden="true" />
                </button>
              </div>
              <AnimatePresence>
                {picking === t.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-1 pt-3 text-sm font-semibold">Wie heeft dit opgelost?</p>
                    <div className="flex flex-wrap gap-2 px-1 pt-2 pb-2">
                      {members.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => finish(t.id, m.id)}
                          className="flex items-center gap-2 rounded-full bg-cream py-1.5 pr-4 pl-1.5 text-sm font-semibold hover:bg-sun"
                        >
                          <span className="grid h-8 w-8 place-items-center rounded-full" style={{ background: m.color }}>
                            <span aria-hidden="true">{m.emoji}</span>
                          </span>
                          {m.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {open.length === 0 && (
        <p className="serif-italic mt-4 text-2xl opacity-70">
          {done.length > 0 ? "Alles afgevinkt. Mooi werk!" : "Nog niets op de lijst."}
        </p>
      )}

      {done.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            aria-expanded={showDone}
            onClick={() => setShowDone((v) => !v)}
            className="inline-flex items-center gap-2 text-sm font-semibold"
          >
            <ChevronDown
              size={18}
              aria-hidden="true"
              className={`transition-transform ${showDone ? "rotate-180" : ""}`}
            />
            Afgerond ({done.length})
          </button>
          <AnimatePresence initial={false}>
            {showDone && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 space-y-2 overflow-hidden"
              >
                {done.map((t) => {
                  const who = members.find((m) => m.id === t.done_by);
                  return (
                    <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-paper/50 p-2 pr-3">
                      <button
                        type="button"
                        aria-label={`Ongedaan maken: ${t.title}`}
                        onClick={() => undoTodo(t.id)}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-ink text-cream"
                      >
                        <Check size={20} strokeWidth={3} aria-hidden="true" />
                      </button>
                      <span className="min-w-0 flex-1 text-base line-through opacity-60 break-words">{t.title}</span>
                      {who && (
                        <span
                          className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-2 ring-ink/20"
                          style={{ background: who.color }}
                          title={`Gedaan door ${who.name}`}
                        >
                          <span aria-hidden="true">{who.emoji}</span>
                          <span className="sr-only">Gedaan door {who.name}</span>
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={`Verwijder: ${t.title}`}
                        onClick={() => removeTodo(t.id)}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full opacity-60 hover:bg-cream hover:opacity-100"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}
