"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export async function addPatient(formData: FormData) {
  const name = (formData.get("name") as string)?.trim() ?? "";
  const service = (formData.get("service") as string)?.trim() ?? "";
  const costRaw = formData.get("cost");
  const cost = costRaw !== null && costRaw !== "" ? Number(costRaw) : 0;
  const referral = (formData.get("referral") as string)?.trim() ?? "";
  const doctor = (formData.get("doctor") as string)?.trim() ?? "";
  const statusRaw = (formData.get("status") as string)?.trim()?.toLowerCase();
  const status =
    statusRaw === "paid" || statusRaw === "pending" ? statusRaw : "pending";
  const date = (formData.get("date") as string)?.trim() || null;

  const { error } = await supabase.from("patients").insert({
    name,
    service,
    cost,
    status,
    referral,
    doctor,
  });

  if (error) {
    console.error("addPatient error:", error);
    throw new Error("Failed to add patient");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/patients");
  const query = date ? `?date=${date}` : "";
  redirect(`/dashboard/patients${query}`);
}
