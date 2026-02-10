import { getDashboardStats, getRecentTransactions } from "@/app/actions/dashboardActions";
import type { DashboardPeriod } from "@/app/actions/dashboardActions";
import { DashboardClient } from "./DashboardClient";

const VALID_PERIODS: DashboardPeriod[] = [
  "today",
  "yesterday",
  "weekly",
  "monthly",
];

function parsePeriod(value: string | null | undefined): DashboardPeriod {
  if (value && VALID_PERIODS.includes(value as DashboardPeriod)) {
    return value as DashboardPeriod;
  }
  return "today";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = parsePeriod(params.period ?? null);

  const [stats, transactions] = await Promise.all([
    getDashboardStats(period),
    getRecentTransactions(),
  ]);

  return (
    <DashboardClient
      period={period}
      stats={stats}
      transactions={transactions}
    />
  );
}
