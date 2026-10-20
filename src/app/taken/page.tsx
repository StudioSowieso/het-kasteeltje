"use client";

import { Pencil, Plus } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { CategoryEditor } from "@/components/CategoryEditor";
import { CategoryIcon } from "@/components/icons";
import { TaskEditor } from "@/components/TaskEditor";
import { recurrenceText } from "@/lib/recurrence";
import { useKasteel } from "@/lib/store";
import type { Category, Task } from "@/lib/types";

export default function TakenPage() {
  const { categories, tasks } = useKasteel();
  const [taskEditor, setTaskEditor] = useState<{ open: boolean; task: Task | null; categoryId?: string }>({
    open: false,
    task: null,
  });
  const [catEditor, setCatEditor] = useState<{ open: boolean; category: Category | null }>({
    open: false,
    category: null,
  });

  return (
    <div>
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-wide uppercase">Beheer</p>
          <h1 className="mt-2 text-5xl leading-[0.95] font-bold tracking-tight sm:text-7xl">
            Taken &<br />
            <span className="serif-italic text-6xl sm:text-8xl">ritme.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base/relaxed">
            Stel per taak in wanneer die terugkomt in de agenda, of plan iets eenmaligs in, zoals grasmaaien.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCatEditor({ open: true, category: null })}
            className="inline-flex items-center gap-2 rounded-full bg-paper px-5 py-3 text-sm font-semibold ring-1 ring-ink/15 hover:bg-white"
          >
            <Plus size={18} aria-hidden="true" /> Categorie
          </button>
          <button
            type="button"
            disabled={categories.length === 0}
            onClick={() => setTaskEditor({ open: true, task: null })}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream disabled:opacity-50"
          >
            <Plus size={18} aria-hidden="true" /> Nieuwe taak
          </button>
        </div>
      </section>

      <section className="mt-10 grid gap-5 md:grid-cols-2">
        {categories.map((cat, i) => {
          const list = tasks.filter((t) => t.category_id === cat.id);
          return (
            <motion.article
              key={cat.id}
              className="rounded-[2.2rem] p-6 sm:p-7"
              style={{ background: cat.color }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4), type: "spring", stiffness: 140, damping: 18 }}
            >
              <header className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-ink bg-paper/60">
                  <CategoryIcon name={cat.icon} size={26} />
                </span>
                <h2 className="flex-1 text-2xl leading-tight font-bold">{cat.name}</h2>
                <button
                  type="button"
                  aria-label={`Categorie ${cat.name} bewerken`}
                  onClick={() => setCatEditor({ open: true, category: cat })}
                  className="grid h-11 w-11 place-items-center rounded-full bg-paper/70 hover:bg-paper"
                >
                  <Pencil size={18} aria-hidden="true" />
                </button>
              </header>

              <ul className="mt-5 space-y-2">
                {list.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => setTaskEditor({ open: true, task: t })}
                      className={`flex w-full items-center justify-between gap-3 rounded-2xl bg-paper/75 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-paper ${
                        t.active ? "" : "opacity-50"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{t.title}</span>
                        <span className="block truncate text-sm opacity-70">
                          {recurrenceText(t)}
                          {t.active ? "" : " · gepauzeerd"}
                        </span>
                      </span>
                      <Pencil size={16} aria-hidden="true" className="shrink-0 opacity-50" />
                    </button>
                  </li>
                ))}
                {list.length === 0 && <li className="text-sm opacity-70">Nog geen taken in deze categorie.</li>}
              </ul>

              <button
                type="button"
                onClick={() => setTaskEditor({ open: true, task: null, categoryId: cat.id })}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-cream"
              >
                <Plus size={16} aria-hidden="true" /> Taak toevoegen
              </button>
            </motion.article>
          );
        })}
      </section>

      {categories.length === 0 && (
        <p className="serif-italic mt-10 text-3xl opacity-70">Begin met een categorie, bijvoorbeeld “Stofzuigen”.</p>
      )}

      <TaskEditor
        open={taskEditor.open}
        task={taskEditor.task}
        defaultCategoryId={taskEditor.categoryId}
        onClose={() => setTaskEditor((s) => ({ ...s, open: false }))}
      />
      <CategoryEditor
        open={catEditor.open}
        category={catEditor.category}
        onClose={() => setCatEditor((s) => ({ ...s, open: false }))}
      />
    </div>
  );
}
