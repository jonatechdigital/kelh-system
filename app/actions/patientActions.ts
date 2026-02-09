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

  const { error } = await supabase.from("patients").insert({
    name,
    service,
    cost,
    status: "pending",
    referral,
  });

  if (error) {
    console.error("addPatient error:", error);
    throw new Error("Failed to add patient");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
