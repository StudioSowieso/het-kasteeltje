"use client";

import { Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { EMOJIS, PALETTE } from "@/components/icons";
import { useKasteel } from "@/lib/store";

export default function HuisgenotenPage() {
  const { members, completions, saveMember, removeMember } = useKasteel();
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [color, setColor] = useState(PALETTE[1]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await saveMember({ name: name.trim(), emoji, color });
    setName("");
    setColor(PALETTE[(members.length + 2) % PALETTE.length]);
    setBusy(false);
  }

  const counts = new Map<string, number>();
  for (const c of completions) if (c.done_by) counts.set(c.done_by, (counts.get(c.done_by) ?? 0) + 1);
  const max = Math.max(1, ...counts.values());

  return (
    <div>
      <section>
        <p className="text-sm font-semibold tracking-wide uppercase">Het kasteel</p>
        <h1 className="mt-2 text-5xl leading-[0.95] font-bold tracking-tight sm:text-7xl">
          Huis-
          <br />
          <span className="serif-italic text-6xl sm:text-8xl">genoten.</span>
        </h1>
        <p className="mt-4 max-w-lg text-base/relaxed">
          Wie woont er in het kasteel? Deze mensen kun je kiezen als je een taak afvinkt.
        </p>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <form onSubmit={add} className="self-start rounded-[2.2rem] bg-rose p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Nieuwe huisgenoot</h2>
          <label className="mt-5 block text-sm font-semibold">
            Naam
            <input
              className="mt-2 w-full rounded-2xl border-2 border-ink/80 bg-paper px-4 py-3 text-base outline-none focus:ring-4 focus:ring-ink/15"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              required
              placeholder="bijv. Sanne"
            />
          </label>

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold">Avatar</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  aria-label={`Avatar ${e}`}
                  aria-pressed={emoji === e}
                  onClick={() => setEmoji(e)}
                  className={`grid h-12 w-12 place-items-center rounded-full text-2xl transition-all ${
                    emoji === e ? "scale-110 bg-ink" : "bg-paper/70 hover:bg-paper"
                  }`}
                >
                  <span aria-hidden="true">{e}</span>
                </button>
              ))}
            </div>
          </fieldset>

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

          <motion.button
            type="submit"
            disabled={busy}
            whileTap={{ scale: 0.97 }}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-cream disabled:opacity-60"
          >
            <Plus size={18} aria-hidden="true" /> Toevoegen
          </motion.button>
        </form>

        <ul className="grid grid-cols-1 content-start gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {members.map((m) => {
              const n = counts.get(m.id) ?? 0;
              return (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="rounded-[2.2rem] p-6"
                  style={{ background: m.color }}
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-16 w-16 place-items-center rounded-full border-2 border-ink bg-paper/60 text-3xl">
                      <span aria-hidden="true">{m.emoji}</span>
                    </span>
                    {confirmId === m.id ? (
                      <button
                        type="button"
                        onClick={async () => {
                          await removeMember(m.id);
                          setConfirmId(null);
                        }}
                        className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-cream"
                      >
                        Zeker weten?
                      </button>
                    ) : (
                      <button
                        type="button"
                        aria-label={`${m.name} verwijderen`}
                        onClick={() => setConfirmId(m.id)}
                        className="grid h-10 w-10 place-items-center rounded-full bg-paper/70 hover:bg-paper"
                      >
                        <Trash2 size={17} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <h3 className="mt-4 text-2xl font-bold">{m.name}</h3>
                  <p className="text-sm opacity-70">
                    {n} {n === 1 ? "taak" : "taken"} gedaan
                  </p>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper/60" aria-hidden="true">
                    <motion.div
                      className="h-full rounded-full bg-ink"
                      initial={{ width: 0 }}
                      animate={{ width: `${(n / max) * 100}%` }}
                      transition={{ type: "spring", stiffness: 70, damping: 16 }}
                    />
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
          {members.length === 0 && <li className="serif-italic text-3xl opacity-70">Nog niemand. Voeg de eerste toe!</li>}
        </ul>
      </section>
    </div>
  );
}
