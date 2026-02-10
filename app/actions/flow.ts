"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabaseClient";
import type { VisitWithPatient, VisitServiceItem } from "@/lib/getVisits";
import { getVisitById } from "@/lib/getVisits";
import type { VisitServiceItem as SchemaServiceItem } from "@/types";

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

/** Build initial services array for new patient: one Consultation line, total 80000 */
function buildInitialServices(): SchemaServiceItem[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Initial Consultation",
      category: "Consultation",
      price: 80000,
    },
  ];
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
  phone?: string;
  referral?: string;
  doctor: string;
  paymentMethod: string;
};

/**
 * Register a new patient and create their first visit.
 * Inserts: patients (name, phone, file_number) then visits (patient_id, doctor, referral_source, services, total_amount, payment_method).
 */
export async function registerPatient(
  data: RegisterPatientData
): Promise<{ id: string; file_number: string; visitId: string } | null> {
  const name = (data.name || "").trim();
  if (!name) throw new Error("Name is required");

  const file_number = await generateFileNumber();
  const phone = (data.phone || "").trim();
  const referral_source = (data.referral || "").trim();
  const doctor = (data.doctor || "").trim();
  const payment_method = (data.paymentMethod || "").trim();

  const services = buildInitialServices();
  const total_amount = 80000;

  const { data: patientRow, error: patientError } = await supabase
    .from("patients")
    .insert({ name, phone, file_number })
    .select("id, file_number")
    .single();

  if (patientError) {
    console.error("registerPatient – patients insert error:", patientError);
    throw new Error(
      `Failed to register patient: ${patientError.message ?? "Unknown error"}`
    );
  }
  if (!patientRow) {
    console.error("registerPatient – patients insert returned no row");
    throw new Error("Failed to register patient: No data returned");
  }

  const { data: visitRow, error: visitError } = await supabase
    .from("visits")
    .insert({
      patient_id: patientRow.id,
      doctor,
      referral_source,
      services,
      total_amount,
      payment_method,
    })
    .select("id")
    .single();

  if (visitError) {
    console.error("registerPatient – visits insert error:", visitError);
    throw new Error(
      `Failed to create visit: ${visitError.message ?? "Unknown error"}`
    );
  }
  if (!visitRow) {
    console.error("registerPatient – visits insert returned no row");
    throw new Error("Failed to create visit: No data returned");
  }

  revalidatePath("/dashboard");
  return {
    id: patientRow.id,
    file_number: patientRow.file_number,
    visitId: visitRow.id,
  };
}

/** Start a visit for an existing (old) patient. Empty services, total_amount 0. */
export async function startVisit(
  patientId: string,
  _isNew: boolean
): Promise<{ id: string } | null> {
  const { data, error } = await supabase
    .from("visits")
    .insert({
      patient_id: patientId,
      doctor: "",
      referral_source: "",
      services: [],
      total_amount: 0,
      payment_method: "",
    })
    .select("id")
    .single();

  if (error) {
    console.error("startVisit – visits insert error:", error);
    throw new Error(`Failed to start visit: ${error.message ?? "Unknown error"}`);
  }
  revalidatePath("/dashboard");
  return data as { id: string };
}

export type UpdateVisitData = {
  doctor?: string;
  referral_source?: string;
  services?: VisitServiceItem[];
  total_amount?: number;
  payment_method?: string;
};

/** Update a visit (doctor, referral_source, services, total_amount, payment_method). */
export async function updateVisit(
  visitId: string,
  data: UpdateVisitData
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.doctor !== undefined) payload.doctor = data.doctor;
  if (data.referral_source !== undefined)
    payload.referral_source = data.referral_source;
  if (data.services !== undefined) payload.services = data.services;
  if (data.total_amount !== undefined) payload.total_amount = data.total_amount;
  if (data.payment_method !== undefined)
    payload.payment_method = data.payment_method;

  const { error } = await supabase.from("visits").update(payload).eq("id", visitId);

  if (error) {
    console.error("updateVisit error:", error);
    throw new Error(`Failed to update visit: ${error.message ?? "Unknown error"}`);
  }
  revalidatePath("/dashboard");
}

/** Fetch a single visit by id (for client). */
export async function getVisitByIdAction(
  visitId: string
): Promise<VisitWithPatient | null> {
  return getVisitById(visitId);
}
