import { supabase } from "@/lib/supabaseClient";

export type ExpenseRow = {
  id: string;
  created_at: string;
  title: string;
  amount: number;
  category: string;
};

function getDateRange(date: Date | string) {
  const d = typeof date === "string" ? new Date(date + "T00:00:00.000Z") : date;
  const from = new Date(d);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

export async function getExpensesByDate(
  date: Date | string
): Promise<ExpenseRow[]> {
  const { from, to } = getDateRange(date);

  const { data, error } = await supabase
    .from("expenses")
    .select("id, created_at, title, amount, category")
    .gte("created_at", from)
    .lt("created_at", to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getExpensesByDate error:", error);
    return [];
  }

  return (data ?? []) as ExpenseRow[];
}
