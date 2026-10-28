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
import type { Category, Completion, Member, Task, Todo } from "./types";

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
  todos: Todo[];
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
  addTodo: (title: string) => Promise<void>;
  completeTodo: (id: string, memberId: string | null) => Promise<void>;
  undoTodo: (id: string) => Promise<void>;
  removeTodo: (id: string) => Promise<void>;
};

const KasteelContext = createContext<Ctx | null>(null);
const CODE_KEY = "kt-code";

export function KasteelProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("checking");
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const clientRef = useRef<SupabaseClient | null>(null);

  const reload = useCallback(async () => {
    const sb = clientRef.current;
    if (!sb) return;
    setLoading(true);
    const [m, c, t, d, td] = await Promise.all([
      sb.from("kt_members").select("*").order("created_at"),
      sb.from("kt_categories").select("*").order("sort").order("name"),
      sb.from("kt_tasks").select("*").order("title"),
      sb.from("kt_completions").select("*").order("done_at", { ascending: false }).limit(5000),
      sb.from("kt_todos").select("*").order("created_at"),
    ]);
    const err = m.error ?? c.error ?? t.error ?? d.error ?? td.error;
    if (err) toast.error(`Laden mislukt: ${err.message}`);
    setMembers((m.data ?? []) as Member[]);
    setCategories((c.data ?? []) as Category[]);
    setTasks((t.data ?? []) as Task[]);
    setCompletions((d.data ?? []) as Completion[]);
    setTodos((td.data ?? []) as Todo[]);
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
    // Geen huiscode meer: de app opent direct.
    try {
      localStorage.removeItem(CODE_KEY);
    } catch {}
    open("open").then((ok) => {
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
    setTodos([]);
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
      todos,
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
      addTodo: (title) => run((sb) => sb.from("kt_todos").insert({ title })),
      completeTodo: (id, memberId) =>
        run((sb) =>
          sb
            .from("kt_todos")
            .update({ done: true, done_by: memberId, done_at: new Date().toISOString() })
            .eq("id", id),
        ),
      undoTodo: (id) =>
        run((sb) => sb.from("kt_todos").update({ done: false, done_by: null, done_at: null }).eq("id", id)),
      removeTodo: (id) => run((sb) => sb.from("kt_todos").delete().eq("id", id)),
    };
  }, [status, loading, lastError, members, categories, tasks, completions, todos, open, lock, reload, run]);

  return <KasteelContext.Provider value={value}>{children}</KasteelContext.Provider>;
}

export function useKasteel(): Ctx {
  const ctx = useContext(KasteelContext);
  if (!ctx) throw new Error("useKasteel moet binnen KasteelProvider gebruikt worden");
  return ctx;
}
