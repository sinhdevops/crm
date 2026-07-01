"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";

export async function getUsersAction() {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((profile) => ({
    id: profile.id,
    tenantId: profile.id,
    email: profile.email,
    name: profile.name || profile.email,
    role: profile.role,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  }));
}

export async function updateUserAction(
  id: string,
  values: { name?: string; role?: string },
) {
  await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      name: values.name,
      role: values.role as "ADMIN" | "MANAGER" | "SALES_REP" | undefined,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/settings");
  return { ok: true };
}

export async function deleteUserAction() {
  throw new Error("Single-user mode does not support deleting workspace members.");
}
