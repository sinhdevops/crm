"use server";

import { revalidatePath } from "next/cache";
import {
  CreateContactBodySchema,
  UpdateContactBodySchema,
} from "@/lib/validations/contacts.scheme";
import type { Database } from "@/lib/supabase/types";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";
import { getContactById, getContacts } from "@/server/queries/contacts";

type ContactActionRow = {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  zalo: string | null;
  facebook: string | null;
  company: string | null;
  position: string | null;
  customer_type: string | null;
  priority: string | null;
  gender: string | null;
  birthday: string | null;
  residence: string | null;
  area_interest: string | null;
  interest_type: string | null;
  purchase_need: string | null;
  budget_min: number | string | null;
  budget_max: number | string | null;
  decision_maker: string | null;
  work_date: string | null;
  last_contacted_date: string | null;
  next_follow_up_date: string | null;
  payment_date: string | null;
  note: string | null;
  solution_plan: string | null;
  assigned_staff: string | null;
  source: string | null;
  next_payment_date: string | null;
  post_sale_status: string | null;
  created_at: string;
  updated_at: string;
};

function mapContactActionRow(row: ContactActionRow) {
  return {
    id: row.id,
    tenantId: row.user_id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    zalo: row.zalo ?? undefined,
    facebook: row.facebook ?? undefined,
    company: row.company ?? undefined,
    position: row.position ?? undefined,
    customerType: row.customer_type ?? undefined,
    priority: row.priority ?? undefined,
    gender: row.gender ?? undefined,
    birthday: row.birthday ?? undefined,
    residence: row.residence ?? undefined,
    areaInterest: row.area_interest ?? undefined,
    interestType: row.interest_type ?? undefined,
    purchaseNeed: row.purchase_need ?? undefined,
    budgetMin: row.budget_min == null ? undefined : Number(row.budget_min),
    budgetMax: row.budget_max == null ? undefined : Number(row.budget_max),
    decisionMaker: row.decision_maker ?? undefined,
    workDate: row.work_date ?? undefined,
    lastContactedDate: row.last_contacted_date ?? undefined,
    nextFollowUpDate: row.next_follow_up_date ?? undefined,
    paymentDate: row.payment_date ?? undefined,
    note: row.note ?? undefined,
    solutionPlan: row.solution_plan ?? undefined,
    assignedStaff: row.assigned_staff ?? "Văn Sinh",
    source: row.source ?? undefined,
    nextPaymentDate: row.next_payment_date ?? undefined,
    postSaleStatus: row.post_sale_status ?? undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function normalizeContactError(error: { message: string; code?: string }) {
  if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
    return new Error("Số điện thoại hoặc email này đã tồn tại trong danh sách khách hàng.");
  }
  return new Error(error.message);
}

const contactFieldMap = {
  name: "name",
  email: "email",
  phone: "phone",
  zalo: "zalo",
  facebook: "facebook",
  company: "company",
  position: "position",
  customerType: "customer_type",
  priority: "priority",
  gender: "gender",
  birthday: "birthday",
  residence: "residence",
  areaInterest: "area_interest",
  interestType: "interest_type",
  purchaseNeed: "purchase_need",
  budgetMin: "budget_min",
  budgetMax: "budget_max",
  decisionMaker: "decision_maker",
  workDate: "work_date",
  lastContactedDate: "last_contacted_date",
  nextFollowUpDate: "next_follow_up_date",
  paymentDate: "payment_date",
  note: "note",
  solutionPlan: "solution_plan",
  assignedStaff: "assigned_staff",
  source: "source",
  nextPaymentDate: "next_payment_date",
  postSaleStatus: "post_sale_status",
} as const;

type ContactUpdatePayload = Database["public"]["Tables"]["contacts"]["Update"];

function toContactUpdatePayload(payload: Record<string, unknown>): ContactUpdatePayload {
  return Object.entries(contactFieldMap).reduce<ContactUpdatePayload>(
    (acc, [formKey, dbKey]) => {
      if (Object.prototype.hasOwnProperty.call(payload, formKey)) {
        const value = payload[formKey] ?? null;
        acc[dbKey as keyof ContactUpdatePayload] = value as never;
      }
      return acc;
    },
    {},
  );
}

export async function getContactsAction(params: unknown) {
  return getContacts(params as any);
}

export async function getContactByIdAction(id: string) {
  return getContactById(id);
}

export async function createContactAction(values: unknown) {
  const user = await requireCurrentUser();
  const payload = CreateContactBodySchema.parse(values);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .insert({
      user_id: user.id,
      name: payload.name,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      zalo: payload.zalo ?? null,
      facebook: payload.facebook ?? null,
      company: payload.company ?? null,
      position: payload.position ?? null,
      customer_type: payload.customerType ?? null,
      priority: payload.priority ?? null,
      gender: payload.gender ?? null,
      birthday: payload.birthday ?? null,
      residence: payload.residence ?? null,
      area_interest: payload.areaInterest ?? null,
      interest_type: payload.interestType ?? null,
      purchase_need: payload.purchaseNeed ?? null,
      budget_min: payload.budgetMin ?? null,
      budget_max: payload.budgetMax ?? null,
      decision_maker: payload.decisionMaker ?? null,
      work_date: payload.workDate ?? null,
      last_contacted_date: payload.lastContactedDate ?? null,
      next_follow_up_date: payload.nextFollowUpDate ?? null,
      payment_date: payload.paymentDate ?? null,
      note: payload.note ?? null,
      solution_plan: payload.solutionPlan ?? null,
      assigned_staff: payload.assignedStaff ?? "Văn Sinh",
      source: payload.source ?? null,
      next_payment_date: payload.nextPaymentDate ?? null,
      post_sale_status: payload.postSaleStatus ?? null,
    })
    .select()
    .single();

  if (error) {
    throw normalizeContactError(error);
  }

  revalidatePath("/contacts");
  return mapContactActionRow(data);
}

export async function updateContactAction(id: string, values: unknown) {
  await requireCurrentUser();
  const payload = UpdateContactBodySchema.parse(values);
  const updatePayload = toContactUpdatePayload(payload);
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw normalizeContactError(error);
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  return mapContactActionRow(data);
}

export async function deleteContactAction(id: string) {
  await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("contacts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/contacts");
  return { ok: true };
}
