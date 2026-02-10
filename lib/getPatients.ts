import { supabase } from "@/lib/supabaseClient";

export type PatientRow = {
  id: string;
  created_at: string;
  name: string;
  service: string;
  cost: number;
  status: "paid" | "pending";
  referral: string;
  doctor?: string | null;
};

/**
 * Get start (inclusive) and end (exclusive) of the given date in UTC.
 */
function getDateRange(date: Date) {
  const from = new Date(date);
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

/**
 * Get patients for a specific date. Pass a Date or "YYYY-MM-DD" string.
 */
export async function getPatientsByDate(
  date: Date | string
): Promise<PatientRow[]> {
  const d = typeof date === "string" ? new Date(date + "T00:00:00.000Z") : date;
  const { from, to } = getDateRange(d);

  const { data, error } = await supabase
    .from("patients")
    .select("id, created_at, name, service, cost, status, referral, doctor")
    .gte("created_at", from)
    .lt("created_at", to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPatientsByDate error:", error);
    return [];
  }

  return (data ?? []) as PatientRow[];
}

/** @deprecated Use getPatientsByDate instead. */
export async function getTodayPatients(): Promise<PatientRow[]> {
  return getPatientsByDate(new Date());
}
