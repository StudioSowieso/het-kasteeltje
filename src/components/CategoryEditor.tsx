"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CategoryIcon, ICONS, PALETTE } from "./icons";
import { Modal } from "./Modal";
import { useKasteel } from "@/lib/store";
import type { Category } from "@/lib/types";

export function CategoryEditor({
  open,
  category,
  onClose,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}) {
  const { categories, saveCategory, removeCategory, tasks } = useKasteel();
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [icon, setIcon] = useState("sparkles");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? "");
    setColor(category?.color ?? PALETTE[categories.length % PALETTE.length]);
    setIcon(category?.icon ?? "sparkles");
    setConfirmDelete(false);
  }, [open, category, categories.length]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await saveCategory({
      id: category?.id,
      name: name.trim(),
      color,
      icon,
      sort: category?.sort ?? categories.length + 1,
    });
    setBusy(false);
    onClose();
  }

  async function del() {
    if (!category) return;
    setBusy(true);
    await removeCategory(category.id);
    setBusy(false);
    onClose();
  }

  const taskCount = category ? tasks.filter((t) => t.category_id === category.id).length : 0;

  return (
    <Modal open={open} onClose={onClose} title={category ? "Categorie bewerken" : "Nieuwe categorie"} background={color}>
      <form onSubmit={submit}>
        <div className="flex items-center gap-4">
          <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-paper/60">
            <CategoryIcon name={icon} size={28} />
          </span>
          <h2 className="text-3xl font-bold tracking-tight">
            {category ? "Categorie" : "Nieuwe"} <span className="serif-italic text-4xl">{category ? "bewerken" : "categorie"}</span>
          </h2>
        </div>

        <label className="mt-6 block text-sm font-semibold">
          Naam
          <input
            className="mt-2 w-full rounded-2xl border-2 border-ink/80 bg-paper px-4 py-3 text-base outline-none focus:ring-4 focus:ring-ink/15"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={60}
            required
            placeholder="bijv. Ramen zemen"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Kleur</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Kleur ${c}`}
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={`h-11 w-11 rounded-full border-2 transition-transform ${
                  color === c ? "scale-110 border-ink" : "border-ink/20"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Icoon</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.keys(ICONS).map((key) => (
              <button
                key={key}
                type="button"
                aria-label={`Icoon ${key}`}
                aria-pressed={icon === key}
                onClick={() => setIcon(key)}
                className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${
                  icon === key ? "bg-ink text-cream" : "bg-paper/70 hover:bg-paper"
                }`}
              >
                <CategoryIcon name={key} />
              </button>
            ))}
          </div>
        </fieldset>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={busy} className="rounded-full bg-ink px-8 py-3.5 font-semibold text-cream disabled:opacity-60">
            Opslaan
          </button>
          <button type="button" onClick={onClose} className="rounded-full px-5 py-3.5 font-semibold hover:bg-paper/60">
            Annuleren
          </button>
          {category &&
            (confirmDelete ? (
              <button type="button" onClick={del} disabled={busy} className="ml-auto rounded-full bg-ink px-5 py-3.5 text-sm font-bold text-cream">
                Ja, verwijder ook {taskCount} {taskCount === 1 ? "taak" : "taken"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="ml-auto rounded-full px-5 py-3.5 text-sm font-semibold text-[#7a1511] hover:bg-paper/60"
              >
                Verwijderen
              </button>
            ))}
        </div>
      </form>
    </Modal>
  );
}
