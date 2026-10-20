"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { makeClient } from "./supabase";
import type { Category, Completion, Member, Task } from "./types";

type Status = "checking" | "locked" | "open";

type TaskInput = Partial<Task> & { title: string; category_id: string };
type CategoryInput = Partial<Category> & { name: string };
type MemberInput = Partial<Member> & { name: string };

type Ctx = {
  status: Status;
  loading: boolean;
  lastError: string;
  members: Member[];
  categories: Category[];
  tasks: Task[];
  completions: Completion[];
  completionMap: Map<string, Completion>;
  unlock: (code: string) => Promise<boolean>;
  lock: () => void;
  reload: () => Promise<void>;
  complete: (taskId: string, date: string, memberId: string | null) => Promise<void>;
  undo: (completion: Completion) => Promise<void>;
  saveTask: (t: TaskInput) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  saveCategory: (c: CategoryInput) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  saveMember: (m: MemberInput) => Promise<void>;
  removeMember: (id: string) => Promise<void>;
};

const KasteelContext = createContext<Ctx | null>(null);
const CODE_KEY = "kt-code";

export function KasteelProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const clientRef = useRef<SupabaseClient | null>(null);

  const reload = useCallback(async () => {
    const sb = clientRef.current;
    if (!sb) return;
    setLoading(true);
    const [m, c, t, d] = await Promise.all([
      sb.from("kt_members").select("*").order("created_at"),
      sb.from("kt_categories").select("*").order("sort").order("name"),
      sb.from("kt_tasks").select("*").order("title"),
      sb.from("kt_completions").select("*").order("done_at", { ascending: false }).limit(5000),
    ]);
    const err = m.error ?? c.error ?? t.error ?? d.error;
    if (err) toast.error(`Laden mislukt: ${err.message}`);
    setMembers((m.data ?? []) as Member[]);
    setCategories((c.data ?? []) as Category[]);
    setTasks((t.data ?? []) as Task[]);
    setCompletions((d.data ?? []) as Completion[]);
    setLoading(false);
  }, []);

  const open = useCallback(
    async (code: string): Promise<boolean> => {
      setLastError("");
      try {
        const sb = makeClient(code);
        const { data, error } = await sb.rpc("kt_ping");
        if (error) {
          setLastError(`Verbinding met de database mislukt: ${error.message}`);
          return false;
        }
        if (data !== true) return false;
        clientRef.current = sb;
        try {
          localStorage.setItem(CODE_KEY, code);
        } catch {}
        setStatus("open");
        await reload();
        return true;
      } catch (e) {
        setLastError(e instanceof Error ? e.message : "Onbekende fout bij verbinden.");
        return false;
      }
    },
    [reload],
  );

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(CODE_KEY);
    } catch {}
    if (!saved) {
      setStatus("locked");
      return;
    }
    open(saved).then((ok) => {
      if (!ok) setStatus("locked");
    });
  }, [open]);

  const lock = useCallback(() => {
    try {
      localStorage.removeItem(CODE_KEY);
    } catch {}
    clientRef.current = null;
    setMembers([]);
    setCategories([]);
    setTasks([]);
    setCompletions([]);
    setStatus("locked");
  }, []);

  /** Voert een schrijfactie uit, toont fouten en laadt daarna alles opnieuw. */
  const run = useCallback(
    async (fn: (sb: SupabaseClient) => PromiseLike<{ error: { message: string } | null }>) => {
      const sb = clientRef.current;
      if (!sb) return;
      const { error } = await fn(sb);
      if (error) {
        toast.error(error.message);
        return;
      }
      await reload();
    },
    [reload],
  );

  const value = useMemo<Ctx>(() => {
    const completionMap = new Map(completions.map((c) => [`${c.task_id}|${c.due_date}`, c]));
    return {
      status,
      loading,
      lastError,
      members,
      categories,
      tasks,
      completions,
      completionMap,
      unlock: open,
      lock,
      reload,
      complete: (taskId, date, memberId) =>
        run((sb) =>
          sb
            .from("kt_completions")
            .upsert(
              { task_id: taskId, due_date: date, done_by: memberId, done_at: new Date().toISOString() },
              { onConflict: "task_id,due_date" },
            ),
        ),
      undo: (c) => run((sb) => sb.from("kt_completions").delete().eq("id", c.id)),
      saveTask: (t) =>
        run((sb) => (t.id ? sb.from("kt_tasks").update(t).eq("id", t.id) : sb.from("kt_tasks").insert(t))),
      removeTask: (id) => run((sb) => sb.from("kt_tasks").delete().eq("id", id)),
      saveCategory: (c) =>
        run((sb) =>
          c.id ? sb.from("kt_categories").update(c).eq("id", c.id) : sb.from("kt_categories").insert(c),
        ),
      removeCategory: (id) => run((sb) => sb.from("kt_categories").delete().eq("id", id)),
      saveMember: (m) =>
        run((sb) => (m.id ? sb.from("kt_members").update(m).eq("id", m.id) : sb.from("kt_members").insert(m))),
      removeMember: (id) => run((sb) => sb.from("kt_members").delete().eq("id", id)),
    };
  }, [status, loading, lastError, members, categories, tasks, completions, open, lock, reload, run]);

  return <KasteelContext.Provider value={value}>{children}</KasteelContext.Provider>;
}

export function useKasteel(): Ctx {
  const ctx = useContext(KasteelContext);
  if (!ctx) throw new Error("useKasteel moet binnen KasteelProvider gebruikt worden");
  return ctx;
}
