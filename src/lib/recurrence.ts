import {
  differenceInCalendarDays,
  differenceInCalendarMonths,
  differenceInCalendarWeeks,
  differenceInCalendarYears,
  eachDayOfInterval,
  format,
  getDate,
  getISODay,
  getMonth,
  lastDayOfMonth,
  parseISO,
} from "date-fns";
import { nl } from "date-fns/locale";
import type { Category, Completion, Occurrence, Task } from "./types";

export const toISO = (d: Date) => format(d, "yyyy-MM-dd");

const DAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
export const WEEKDAY_LABELS = DAYS;

function matches(task: Task, d: Date, start: Date): boolean {
  const n = Math.max(1, task.every_n);
  switch (task.unit) {
    case "day": {
      const diff = differenceInCalendarDays(d, start);
      return diff >= 0 && diff % n === 0;
    }
    case "week": {
      const weeks = differenceInCalendarWeeks(d, start, { weekStartsOn: 1 });
      if (weeks < 0 || weeks % n !== 0) return false;
      const days = task.weekdays.length ? task.weekdays : [getISODay(start)];
      return days.includes(getISODay(d));
    }
    case "month": {
      const months = differenceInCalendarMonths(d, start);
      if (months < 0 || months % n !== 0) return false;
      return getDate(d) === Math.min(getDate(start), getDate(lastDayOfMonth(d)));
    }
    case "year": {
      const years = differenceInCalendarYears(d, start);
      if (years < 0 || years % n !== 0) return false;
      if (getMonth(d) !== getMonth(start)) return false;
      return getDate(d) === Math.min(getDate(start), getDate(lastDayOfMonth(d)));
    }
  }
}

/** Alle datums (yyyy-MM-dd) waarop een taak voorkomt binnen [from, to]. */
export function occurrenceDates(task: Task, from: Date, to: Date): string[] {
  if (!task.active) return [];
  const fromS = toISO(from);
  const toS = toISO(to);

  if (task.kind === "once") {
    if (!task.once_date) return [];
    return task.once_date >= fromS && task.once_date <= toS ? [task.once_date] : [];
  }

  const start = parseISO(task.start_date);
  const firstDay = from > start ? from : start;
  if (firstDay > to) return [];

  return eachDayOfInterval({ start: firstDay, end: to })
    .filter((d) => matches(task, d, start))
    .map(toISO)
    .filter((s) => !task.end_date || s <= task.end_date);
}

export function buildOccurrences(
  tasks: Task[],
  categories: Category[],
  completionMap: Map<string, Completion>,
  from: Date,
  to: Date,
): Occurrence[] {
  const catById = new Map(categories.map((c) => [c.id, c]));
  const out: Occurrence[] = [];
  for (const task of tasks) {
    for (const date of occurrenceDates(task, from, to)) {
      const key = `${task.id}|${date}`;
      const completion = completionMap.get(key);
      if (completion?.skipped) continue; // overgeslagen: niet tonen
      out.push({
        key,
        date,
        task,
        category: catById.get(task.category_id),
        completion,
      });
    }
  }
  return out.sort(
    (a, b) => a.date.localeCompare(b.date) || a.task.title.localeCompare(b.task.title, "nl"),
  );
}

export function recurrenceText(task: Task): string {
  if (task.kind === "once") {
    return task.once_date
      ? `Eenmalig · ${format(parseISO(task.once_date), "EEE d MMM", { locale: nl })}`
      : "Eenmalig";
  }
  const n = task.every_n;
  const start = parseISO(task.start_date);
  switch (task.unit) {
    case "day":
      return n === 1 ? "Elke dag" : `Elke ${n} dagen`;
    case "week": {
      const base = n === 1 ? "Elke week" : `Elke ${n} weken`;
      const days = (task.weekdays.length ? task.weekdays : [getISODay(start)])
        .slice()
        .sort((a, b) => a - b)
        .map((d) => DAYS[d - 1])
        .join(", ");
      return `${base} op ${days}`;
    }
    case "month":
      return `${n === 1 ? "Elke maand" : `Elke ${n} maanden`} op de ${getDate(start)}e`;
    case "year":
      return `${n === 1 ? "Elk jaar" : `Elke ${n} jaar`} op ${format(start, "d MMMM", { locale: nl })}`;
  }
}
