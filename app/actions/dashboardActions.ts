"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabaseClient";

export type DashboardPeriod = "today" | "yesterday" | "weekly" | "monthly";

function getDateRange(period: DashboardPeriod): { from: string; to: string } {
  const now = new Date();
  const to = new Date(now);
  to.setUTCMinutes(to.getUTCMinutes() + 1);
  let from: Date;

  switch (period) {
    case "today": {
      from = new Date(now);
      from.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "yesterday": {
      from = new Date(now);
      from.setUTCDate(from.getUTCDate() - 1);
      from.setUTCHours(0, 0, 0, 0);
      const endYesterday = new Date(from);
      endYesterday.setUTCDate(endYesterday.getUTCDate() + 1);
      return { from: from.toISOString(), to: endYesterday.toISOString() };
    }
    case "weekly": {
      const day = now.getUTCDay();
      const diff = day === 0 ? 6 : day - 1;
      from = new Date(now);
      from.setUTCDate(from.getUTCDate() - diff);
      from.setUTCHours(0, 0, 0, 0);
      break;
    }
    case "monthly": {
      from = new Date(now);
      from.setUTCDate(1);
      from.setUTCHours(0, 0, 0, 0);
      break;
    }
    default: {
      from = new Date(now);
      from.setUTCHours(0, 0, 0, 0);
    }
  }

  return { from: from.toISOString(), to: to.toISOString() };
}

export type DashboardStats = {
  patientsSeen: number;
  cashIn: number;
  cashOut: number;
  netCash: number;
};

/** Compute dashboard stats for the given period. */
export async function getDashboardStats(
  period: DashboardPeriod
): Promise<DashboardStats> {
  const { from, to } = getDateRange(period);

  const [visitsRes, expensesRes] = await Promise.all([
    supabase
      .from("visits")
      .select("id, total_paid, total_amount, consultation_fee, consultation_status, treatment_cost")
      .gte("created_at", from)
      .lt("created_at", to),
    supabase
      .from("expenses")
      .select("amount")
      .gte("created_at", from)
      .lt("created_at", to),
  ]);

  const visits = (visitsRes.data ?? []) as {
    id: string;
    total_paid?: number;
    total_amount?: number;
    consultation_fee: number;
    consultation_status: string;
    treatment_cost: number;
  }[];
  const expenses = (expensesRes.data ?? []) as { amount: number }[];

  const patientsSeen = visits.length;
  const cashIn = visits.reduce((sum, v) => {
    const totalPaid = Number(v.total_paid);
    if (totalPaid > 0) return sum + totalPaid;
    const totalAmount = Number(v.total_amount);
    if (totalAmount > 0 && v.consultation_status === "paid") return sum + totalAmount;
    if (v.consultation_status === "paid")
      return sum + Number(v.consultation_fee || 0) + Number(v.treatment_cost || 0);
    return sum;
  }, 0);
  const cashOut = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const netCash = cashIn - cashOut;

  return { patientsSeen, cashIn, cashOut, netCash };
}

export type RecentTransaction = {
  id: string;
  time: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
};

/** Last 5 visits + last 5 expenses merged and sorted by time (newest first). */
export async function getRecentTransactions(): Promise<RecentTransaction[]> {
  const [visitsRes, expensesRes] = await Promise.all([
    supabase
      .from("visits")
      .select("id, created_at, total_paid, total_amount, consultation_fee, treatment_cost, consultation_status, patient_id")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("expenses")
      .select("id, created_at, title, amount, category")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const visits = (visitsRes.data ?? []) as {
    id: string;
    created_at: string;
    total_paid?: number;
    total_amount?: number;
    consultation_fee: number;
    treatment_cost: number;
    consultation_status: string;
    patient_id: string;
  }[];
  const expenses = (expensesRes.data ?? []) as {
    id: string;
    created_at: string;
    title: string;
    amount: number;
    category: string;
  }[];

  const patientIds = [...new Set(visits.map((v) => v.patient_id))];
  let patientMap = new Map<string, { name: string }>();
  if (patientIds.length > 0) {
    const { data: patients } = await supabase
      .from("patients")
      .select("id, name")
      .in("id", patientIds);
    patientMap = new Map(
      (patients ?? []).map((p: { id: string; name: string }) => [p.id, { name: p.name }])
    );
  }

  const incomeItems: RecentTransaction[] = visits.map((v) => {
    const total =
      Number(v.total_paid) ||
      Number(v.total_amount) ||
      Number(v.consultation_fee || 0) + Number(v.treatment_cost || 0);
    return {
      id: `visit-${v.id}`,
      time: v.created_at,
      description: patientMap.get(v.patient_id)?.name ?? "—",
      category: "Visit",
      amount: total,
      type: "income",
    };
  });

  const expenseItems: RecentTransaction[] = expenses.map((e) => ({
    id: `expense-${e.id}`,
    time: e.created_at,
    description: e.title,
    category: e.category,
    amount: -Number(e.amount || 0),
    type: "expense",
  }));

  const merged = [...incomeItems, ...expenseItems].sort(
    (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
  );

  return merged;
}
