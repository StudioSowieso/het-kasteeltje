"use client";

import { CalendarDays, ListChecks, Users } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { Gate } from "./Gate";
import { KasteelProvider, useKasteel } from "@/lib/store";

const NAV = [
  { href: "/", label: "Agenda", Icon: CalendarDays },
  { href: "/taken", label: "Taken", Icon: ListChecks },
  { href: "/huisgenoten", label: "Huisgenoten", Icon: Users },
];

function Frame({ children }: { children: ReactNode }) {
  const { status } = useKasteel();
  const pathname = usePathname();

  if (status !== "open") return <Gate />;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 pt-5 pb-32 sm:px-8">
      <header className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span aria-hidden="true" className="grid h-9 w-9 place-items-center rounded-full bg-ink text-cream">
            ♜
          </span>
          Het Kasteeltje
        </Link>
</header>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          className="flex-1 pt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <nav
        aria-label="Hoofdnavigatie"
        className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-full bg-ink p-1.5 shadow-2xl"
      >
        <ul className="flex items-center gap-1">
          {NAV.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold transition-colors ${
                    active ? "text-ink" : "text-cream/80 hover:text-cream"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-sun"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon size={18} aria-hidden="true" className="relative" />
                  <span className={`relative ${active ? "" : "hidden sm:inline"}`}>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <KasteelProvider>
        <Frame>{children}</Frame>
      </KasteelProvider>
      <Toaster position="top-center" richColors closeButton />
    </MotionConfig>
  );
}
