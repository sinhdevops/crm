"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LoginBodySchema, RegisterBodySchema } from "@/lib/validations/auth.schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAction(values: unknown) {
  const payload = LoginBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(payload);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function registerAction(values: unknown) {
  const payload = RegisterBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        company_name: payload.companyName,
      },
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return { ok: true };
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login");
}
