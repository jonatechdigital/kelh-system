"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export async function addExpense(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() ?? "";
  const amountRaw = formData.get("amount");
  const amount =
    amountRaw !== null && amountRaw !== "" ? Number(amountRaw) : 0;
  const category = (formData.get("category") as string)?.trim() ?? "";
  const date = (formData.get("date") as string)?.trim() || null;

  const { error } = await supabase.from("expenses").insert({
    title,
    amount,
    category,
  });

  if (error) {
    console.error("addExpense error:", error);
    throw new Error("Failed to add expense");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/overview");
  revalidatePath("/dashboard/expenses");
  const query = date ? `?date=${date}` : "";
  redirect(`/dashboard/expenses${query}`);
}

/** Add expense without redirect (for dashboard modal). Returns { ok: true } on success. */
export async function addExpenseNoRedirect(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  const title = (formData.get("title") as string)?.trim() ?? "";
  const amountRaw = formData.get("amount");
  const amount =
    amountRaw !== null && amountRaw !== "" ? Number(amountRaw) : 0;
  const category = (formData.get("category") as string)?.trim() ?? "";

  const { error } = await supabase.from("expenses").insert({
    title,
    amount,
    category,
  });

  if (error) {
    console.error("addExpenseNoRedirect error:", error);
    return { ok: false, error: "Failed to add expense" };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/expenses");
  return { ok: true };
}
