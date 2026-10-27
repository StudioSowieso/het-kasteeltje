export type Member = {
  id: string;
  name: string;
  color: string;
  emoji: string;
};

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
  sort: number;
};

export type Unit = "day" | "week" | "month" | "year";

export type Task = {
  id: string;
  category_id: string;
  title: string;
  notes: string | null;
  kind: "once" | "recurring";
  once_date: string | null;
  every_n: number;
  unit: Unit;
  weekdays: number[];
  start_date: string;
  end_date: string | null;
  active: boolean;
};

export type Completion = {
  id: string;
  task_id: string;
  due_date: string;
  done_by: string | null;
  done_at: string;
  skipped: boolean;
};

export type Occurrence = {
  key: string;
  date: string;
  task: Task;
  category: Category | undefined;
  completion: Completion | undefined;
};
