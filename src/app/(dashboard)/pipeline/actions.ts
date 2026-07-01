"use server";

import { revalidatePath } from "next/cache";
import {
  CreateDealBodySchema,
  DealStage,
  UpdateDealBodySchema,
  UpdateDealStageBodySchema,
} from "@/lib/validations/deals.schema";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";
import { getDealById, getPipeline } from "@/server/queries/deals";

const stageProbabilities: Record<DealStage, number> = {
  PROSPECT: 10,
  CONSULTING: 25,
  VIEWING: 45,
  NEGOTIATION: 65,
  DEPOSIT: 90,
  CLOSED_WON: 100,
  CLOSED_LOST: 0,
};

export async function getPipelineAction() {
  return getPipeline();
}

export async function getDealByIdAction(id: string) {
  return getDealById(id);
}

export async function createDealAction(values: unknown) {
  const user = await requireCurrentUser();
  const payload = CreateDealBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("deals")
    .insert({
      user_id: user.id,
      contact_id: payload.contactId,
      title: payload.title,
      value: payload.value,
      stage: payload.stage,
      probability: payload.probability ?? stageProbabilities[payload.stage],
      priority: payload.priority ?? null,
      lead_source: payload.leadSource ?? null,
      property_project: payload.propertyProject ?? null,
      property_type: payload.propertyType ?? null,
      property_code: payload.propertyCode ?? null,
      property_area: payload.propertyArea ?? null,
      appointment_date: payload.appointmentDate?.toISOString() ?? null,
      lost_reason: payload.lostReason ?? null,
      close_date: payload.closeDate.toISOString(),
      note: payload.note ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pipeline");
  return data;
}

export async function updateDealAction(id: string, values: unknown) {
  await requireCurrentUser();
  const payload = UpdateDealBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const updatePayload = {
    title: payload.title,
    value: payload.value,
    stage: payload.stage,
    probability: payload.probability,
    priority: payload.priority,
    lead_source: payload.leadSource,
    property_project: payload.propertyProject,
    property_type: payload.propertyType,
    property_code: payload.propertyCode,
    property_area: payload.propertyArea,
    appointment_date: payload.appointmentDate ? payload.appointmentDate.toISOString() : payload.appointmentDate,
    lost_reason: payload.lostReason,
    close_date: payload.closeDate ? payload.closeDate.toISOString() : payload.closeDate,
    note: payload.note,
  };
  const { data, error } = await supabase
    .from("deals")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
  return data;
}

export async function updateDealStageAction(id: string, values: unknown) {
  await requireCurrentUser();
  const payload = UpdateDealStageBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("deals")
    .update({
      stage: payload.stage,
      probability: payload.probability ?? stageProbabilities[payload.stage],
      lost_reason: payload.lostReason ?? null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pipeline");
  revalidatePath(`/pipeline/${id}`);
  return data;
}

export async function deleteDealAction(id: string) {
  await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("deals")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/pipeline");
  return { ok: true };
}

export async function analyzeDealAction(_id: string, meetingNote: string) {
  await requireCurrentUser();
  const trimmed = meetingNote.trim();
  const summary = trimmed.length > 240 ? `${trimmed.slice(0, 240)}...` : trimmed;

  return {
    tasks: [
      {
        title: "Review meeting notes and confirm next step",
        dueDate: null,
      },
      {
        title: "Send follow-up email to the contact",
        dueDate: null,
      },
    ],
    emailDraft: `Hi,\n\nThanks for the meeting. Here is a quick summary:\n\n${summary}\n\nNext, I will follow up with the agreed action items.\n\nBest regards,`,
  };
}

export async function createTaskAction(
  dealId: string,
  title: string,
  dueDate?: string | null,
) {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      deal_id: dealId,
      title,
      due_date: dueDate ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/pipeline/${dealId}`);
  return {
    id: data.id,
    title: data.title,
    done: data.done,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    createdAt: new Date(data.created_at),
  };
}

export async function createTasksBulkAction(
  dealId: string,
  tasks: Array<{ title: string; dueDate?: string | null }>,
) {
  const created = [];
  for (const task of tasks) {
    created.push(await createTaskAction(dealId, task.title, task.dueDate ?? null));
  }
  return created;
}

export async function updateTaskAction(
  dealId: string,
  taskId: string,
  values: { title?: string; done?: boolean; dueDate?: string | null },
) {
  await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: values.title,
      done: values.done,
      due_date: values.dueDate,
    })
    .eq("id", taskId)
    .eq("deal_id", dealId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  revalidatePath(`/pipeline/${dealId}`);
  return {
    id: data.id,
    title: data.title,
    done: data.done,
    dueDate: data.due_date ? new Date(data.due_date) : null,
    createdAt: new Date(data.created_at),
  };
}

export async function deleteTaskAction(dealId: string, taskId: string) {
  await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("deal_id", dealId);

  if (error) throw new Error(error.message);

  revalidatePath(`/pipeline/${dealId}`);
  return { ok: true };
}
