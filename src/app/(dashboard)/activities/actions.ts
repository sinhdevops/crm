"use server";

import { revalidatePath } from "next/cache";
import {
  CreateActivityForContactBodySchema,
  CreateActivityForDealBodySchema,
  UpdateActivityBodySchema,
} from "@/lib/validations/activities.scheme";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";
import { getActivities } from "@/server/queries/activities";

export async function getActivitiesAction(params: unknown) {
  return getActivities(params as any);
}

export async function createContactActivityAction(contactId: string, values: unknown) {
  const user = await requireCurrentUser();
  const payload = CreateActivityForContactBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      contact_id: contactId,
      type: payload.type,
      title: payload.title ?? null,
      note: payload.note,
      date: payload.date?.toISOString() ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/activities");
  revalidatePath(`/contacts/${contactId}`);
  return data;
}

export async function createDealActivityAction(dealId: string, values: unknown) {
  const user = await requireCurrentUser();
  const payload = CreateActivityForDealBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activities")
    .insert({
      user_id: user.id,
      deal_id: dealId,
      contact_id: payload.contactId ?? null,
      type: payload.type,
      title: payload.title ?? null,
      note: payload.note,
      date: payload.date?.toISOString() ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/activities");
  revalidatePath(`/pipeline/${dealId}`);
  return data;
}

export async function updateActivityAction(id: string, values: unknown) {
  await requireCurrentUser();
  const payload = UpdateActivityBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("activities")
    .update({
      type: payload.type,
      title: payload.title,
      note: payload.note,
      date: payload.date?.toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath("/activities");
  return data;
}

export async function deleteActivityAction(id: string) {
  await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/activities");
  return { ok: true };
}
