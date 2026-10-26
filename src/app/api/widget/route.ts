import { subDays } from "date-fns";
import { NextResponse } from "next/server";
import { buildOccurrences, toISO } from "@/lib/recurrence";
import { makeClient } from "@/lib/supabase";
import type { Category, Completion, Task } from "@/lib/types";

export const dynamic = "force-dynamic";

/** Vandaag volgens de klok in Nederland, als lokale datum (werkt ongeacht de servertijdzone). */
function todayInAmsterdam(): Date {
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Amsterdam",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Gegevens voor een beginschermwidget (KWGT, Tasker e.d.): wat moet er nog gedaan worden?
 *   /api/widget              -> JSON
 *   /api/widget?format=text  -> platte tekst, één taak per regel
 * Toont taken van vandaag en achterstallige taken van de afgelopen 7 dagen.
 */
export async function GET(request: Request) {
  const sb = makeClient("open");
  const today = todayInAmsterdam();
  const todayISO = toISO(today);
  const from = subDays(today, 7);

  const [t, c, d] = await Promise.all([
    sb.from("kt_tasks").select("*"),
    sb.from("kt_categories").select("*"),
    sb.from("kt_completions").select("*").gte("due_date", toISO(from)).lte("due_date", todayISO),
  ]);

  const error = t.error ?? c.error ?? d.error;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  const completions = (d.data ?? []) as Completion[];
  const completionMap = new Map(completions.map((x) => [`${x.task_id}|${x.due_date}`, x]));
  const occ = buildOccurrences(
    (t.data ?? []) as Task[],
    (c.data ?? []) as Category[],
    completionMap,
    from,
    today,
  );

  const open = occ.filter((o) => !o.completion);
  const todayAll = occ.filter((o) => o.date === todayISO);
  const items = open.map((o) => ({
    title: o.task.title,
    category: o.category?.name ?? "",
    color: o.category?.color ?? "#F9DB6D",
    date: o.date,
    overdue: o.date < todayISO,
  }));

  const count = items.length;
  const summary = count === 0 ? "Alles gedaan!" : count === 1 ? "1 taak te doen" : `${count} taken te doen`;
  const text = items.map((i) => `${i.overdue ? "! " : "• "}${i.title}`).join("\n");

  const headers = { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" };

  if (new URL(request.url).searchParams.get("format") === "text") {
    return new Response(count === 0 ? summary : text, {
      headers: { ...headers, "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  return NextResponse.json(
    {
      date: todayISO,
      open: count,
      doneToday: todayAll.filter((o) => o.completion).length,
      totalToday: todayAll.length,
      summary,
      text,
      items,
    },
    { headers },
  );
}
