import { getPatientsByDate } from "@/lib/getPatients";
import { PatientsClient } from "./PatientsClient";

type Props = {
  searchParams: Promise<{ date?: string }>;
};

export default async function PatientsPage({ searchParams }: Props) {
  const { date: dateParam } = await searchParams;
  const date = dateParam || new Date().toISOString().slice(0, 10);
  const patients = await getPatientsByDate(date);

  return <PatientsClient initialPatients={patients} selectedDate={date} />;
}
