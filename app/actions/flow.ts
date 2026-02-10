"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabaseClient";
import type { VisitWithPatient } from "@/lib/getVisits";
import { getVisitById } from "@/lib/getVisits";

function randomFourDigits(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

async function generateFileNumber(): Promise<string> {
  let fileNumber: string;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 20) {
    fileNumber = "KELH-" + randomFourDigits();
    const { data } = await supabase
      .from("patients")
      .select("id")
      .eq("file_number", fileNumber)
      .limit(1)
      .maybeSingle();
    exists = !!data;
    if (!exists) return fileNumber!;
    attempts++;
  }
  return "KELH-" + randomFourDigits();
}

export type SearchPatientRow = {
  id: string;
  file_number: string | null;
  name: string;
};

/** Search patients by name or file number (case-insensitive). */
export async function searchPatients(
  query: string
): Promise<SearchPatientRow[]> {
  const q = (query || "").trim();
  if (!q) return [];

  const { data, error } = await supabase
    .from("patients")
    .select("id, file_number, name")
    .or(`name.ilike.%${q}%,file_number.ilike.%${q}%`)
    .limit(20);

  if (error) {
    console.error("searchPatients error:", error);
    return [];
  }
  return (data ?? []) as SearchPatientRow[];
}

export type RegisterPatientData = {
  name: string;
  referral?: string;
};

/** Create a new patient with auto-generated file number. */
export async function registerPatient(
  data: RegisterPatientData
): Promise<{ id: string; file_number: string } | null> {
  const name = (data.name || "").trim();
  if (!name) throw new Error("Name is required");

  const file_number = await generateFileNumber();

  const { data: row, error } = await supabase
    .from("patients")
    .insert({
      name,
      file_number,
      service: "",
      cost: 0,
      status: "pending",
      referral: (data.referral || "").trim() || "",
      doctor: "",
    })
    .select("id, file_number")
    .single();

  if (error) {
    console.error("registerPatient error:", error);
    throw new Error("Failed to register patient");
  }
  revalidatePath("/dashboard");
  return row as { id: string; file_number: string };
}

/** Start a visit. isNew=true -> consultation_fee=80000, else 0. */
export async function startVisit(
  patientId: string,
  isNew: boolean
): Promise<{ id: string } | null> {
  const consultation_fee = isNew ? 80000 : 0;

  const { data, error } = await supabase
    .from("visits")
    .insert({
      patient_id: patientId,
      consultation_fee,
      consultation_status: "pending",
      treatment_cost: 0,
      status: "active",
    })
    .select("id")
    .single();

  if (error) {
    console.error("startVisit error:", error);
    throw new Error("Failed to start visit");
  }
  revalidatePath("/dashboard");
  return data as { id: string };
}

export type UpdateVisitData = {
  doctor?: string;
  consultation_status?: "pending" | "paid" | "waived";
  treatment_cost?: number;
  findings?: string;
  status?: "active" | "closed";
};

/** Update a visit (doctor, costs, status, findings, close). */
export async function updateVisit(
  visitId: string,
  data: UpdateVisitData
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.doctor !== undefined) payload.doctor = data.doctor;
  if (data.consultation_status !== undefined)
    payload.consultation_status = data.consultation_status;
  if (data.treatment_cost !== undefined) payload.treatment_cost = data.treatment_cost;
  if (data.findings !== undefined) payload.findings = data.findings;
  if (data.status !== undefined) payload.status = data.status;

  const { error } = await supabase.from("visits").update(payload).eq("id", visitId);

  if (error) {
    console.error("updateVisit error:", error);
    throw new Error("Failed to update visit");
  }
  revalidatePath("/dashboard");
}

/** Fetch a single visit by id (for client). */
export async function getVisitByIdAction(
  visitId: string
): Promise<VisitWithPatient | null> {
  return getVisitById(visitId);
}
