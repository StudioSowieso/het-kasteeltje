"use client";

import { motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Scallop } from "./Scallop";
import { useKasteel } from "@/lib/store";

export function Gate() {
  const { unlock, status } = useKasteel();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    setError("");
    const ok = await unlock(code.trim());
    if (!ok) setError("Die code klopt niet. Probeer het nog eens.");
    setBusy(false);
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-6 py-16">
      <motion.div
        className="absolute -top-16 -left-10"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 14 }}
      >
        <Scallop color="#a8bc82" size={260} lobes={9} spin />
      </motion.div>
      <motion.div
        className="absolute -right-12 bottom-10"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
      >
        <Scallop color="#f4b8dc" size={300} lobes={12} depth={0.09} spin />
      </motion.div>
      <motion.div
        className="absolute top-1/3 right-[12%] hidden h-28 w-28 rotate-12 rounded-[1.6rem] bg-sun sm:block"
        initial={{ y: 40, opacity: 0, rotate: -10 }}
        animate={{ y: 0, opacity: 1, rotate: 12 }}
        transition={{ type: "spring", stiffness: 90, damping: 12, delay: 0.2 }}
      />

      <motion.form
        onSubmit={submit}
        className="relative z-10 w-full max-w-md"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 18 }}
      >
        <p className="text-sm font-medium tracking-wide uppercase">Het Kasteeltje</p>
        <h1 className="mt-3 text-5xl leading-[0.95] font-bold tracking-tight sm:text-6xl">
          Wie poetst er
          <br />
          <span className="serif-italic text-6xl sm:text-7xl">vandaag?</span>
        </h1>
        <p className="mt-5 max-w-sm text-base/relaxed">
          Voer de huiscode in om het huishouden van het kasteel te openen.
        </p>

        {status === "checking" ? (
          <p className="mt-8 text-sm" role="status">
            Poort wordt geopend…
          </p>
        ) : (
          <>
            <label htmlFor="code" className="mt-8 block text-sm font-semibold">
              Huiscode
            </label>
            <input
              id="code"
              name="code"
              type="password"
              autoComplete="off"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? "code-error" : undefined}
              className="mt-2 w-full rounded-full border-2 border-ink bg-paper px-6 py-4 text-lg outline-none focus:ring-4 focus:ring-sun"
              placeholder="bijv. toren-1234"
            />
            {error && (
              <p id="code-error" role="alert" className="mt-3 text-sm font-semibold text-[#a3201a]">
                {error}
              </p>
            )}
            <motion.button
              type="submit"
              disabled={busy}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-lg font-semibold text-cream disabled:opacity-60"
            >
              {busy ? "Even kijken…" : "Binnenkomen →"}
            </motion.button>
          </>
        )}
      </motion.form>
    </main>
  );
}
