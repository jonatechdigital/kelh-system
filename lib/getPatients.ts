import { supabase } from "@/lib/supabaseClient";

export type PatientRow = {
  id: string;
  created_at: string;
  name: string;
  service: string;
  cost: number;
  status: "paid" | "pending";
  referral: string;
};

export async function getTodayPatients(): Promise<PatientRow[]> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const from = todayStart.toISOString();

  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);
  const to = tomorrowStart.toISOString();

  const { data, error } = await supabase
    .from("patients")
    .select("id, created_at, name, service, cost, status, referral")
    .gte("created_at", from)
    .lt("created_at", to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getTodayPatients error:", error);
    return [];
  }

  return (data ?? []) as PatientRow[];
}
