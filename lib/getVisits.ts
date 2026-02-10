import { supabase } from "@/lib/supabaseClient";

export type VisitRow = {
  id: string;
  created_at: string;
  patient_id: string;
  consultation_fee: number;
  consultation_status: "pending" | "paid" | "waived";
  treatment_cost: number;
  doctor: string | null;
  findings: string | null;
  status: "active" | "closed";
};

export type VisitWithPatient = VisitRow & {
  patient: {
    id: string;
    name: string;
    file_number: string | null;
  };
};

function getTodayRange() {
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setUTCDate(to.getUTCDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

/** Fetch today's active visits with patient name and file number. */
export async function getActiveVisitsToday(): Promise<VisitWithPatient[]> {
  const { from, to } = getTodayRange();

  const { data: visits, error: visitError } = await supabase
    .from("visits")
    .select(
      "id, created_at, patient_id, consultation_fee, consultation_status, treatment_cost, doctor, findings, status"
    )
    .eq("status", "active")
    .gte("created_at", from)
    .lt("created_at", to)
    .order("created_at", { ascending: false });

  if (visitError || !visits?.length) {
    if (visitError) console.error("getActiveVisitsToday visits error:", visitError);
    return [];
  }

  const patientIds = [...new Set(visits.map((v) => v.patient_id))];
  const { data: patients, error: patientError } = await supabase
    .from("patients")
    .select("id, name, file_number")
    .in("id", patientIds);

  if (patientError || !patients?.length) {
    if (patientError) console.error("getActiveVisitsToday patients error:", patientError);
    return [];
  }

  const patientMap = new Map(patients.map((p) => [p.id, p]));
  return visits.map((v) => ({
    ...v,
    patient: patientMap.get(v.patient_id) ?? {
      id: v.patient_id,
      name: "—",
      file_number: null,
    },
  })) as VisitWithPatient[];
}

/** Fetch a single visit by id with patient. */
export async function getVisitById(
  visitId: string
): Promise<VisitWithPatient | null> {
  const { data: visit, error: visitError } = await supabase
    .from("visits")
    .select(
      "id, created_at, patient_id, consultation_fee, consultation_status, treatment_cost, doctor, findings, status"
    )
    .eq("id", visitId)
    .single();

  if (visitError || !visit) {
    if (visitError) console.error("getVisitById error:", visitError);
    return null;
  }

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, name, file_number")
    .eq("id", visit.patient_id)
    .single();

  if (patientError || !patient) {
    return {
      ...visit,
      patient: { id: visit.patient_id, name: "—", file_number: null },
    } as VisitWithPatient;
  }

  return { ...visit, patient } as VisitWithPatient;
}
