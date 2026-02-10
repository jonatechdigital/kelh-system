import { getExpensesByDate } from "@/lib/getExpenses";
import { ExpensesClient } from "./ExpensesClient";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function ExpensesPage({ searchParams }: Props) {
  const { date: dateParam } = await searchParams;
  const date = dateParam || new Date().toISOString().slice(0, 10);
  const expenses = await getExpensesByDate(date);

  return <ExpensesClient initialExpenses={expenses} selectedDate={date} />;
}
