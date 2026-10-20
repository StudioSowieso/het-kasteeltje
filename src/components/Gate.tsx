"use client";

import { motion } from "motion/react";
import { Scallop } from "./Scallop";
import { useKasteel } from "@/lib/store";

/** Laadscherm, of een foutscherm als de verbinding met de database mislukt. */
export function Gate() {
  const { status, lastError, unlock } = useKasteel();

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

      <div className="relative z-10 w-full max-w-md">
        <p className="text-sm font-medium tracking-wide uppercase">Het Kasteeltje</p>
        {status === "checking" ? (
          <p role="status" className="mt-3 text-3xl font-bold tracking-tight">
            Poort wordt geopend…
          </p>
        ) : (
          <>
            <h1 className="mt-3 text-4xl leading-tight font-bold tracking-tight">Oeps, de poort klemt.</h1>
            <p role="alert" className="mt-4 text-base/relaxed">
              {lastError || "Er kon geen verbinding met de database worden gemaakt."}
            </p>
            <button
              type="button"
              onClick={() => unlock("open")}
              className="mt-6 rounded-full bg-ink px-8 py-4 text-lg font-semibold text-cream"
            >
              Opnieuw proberen
            </button>
          </>
        )}
      </div>
    </main>
  );
}
