import { getTodayPatients } from "@/lib/getPatients";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const patients = await getTodayPatients();
  return <DashboardClient initialPatients={patients} />;
}
