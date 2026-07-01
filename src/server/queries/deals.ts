import type {
  DealCard,
  DealDetail,
  DealStage,
  PipelineRes,
} from "@/lib/validations/deals.schema";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";
import { getCurrentOwner } from "./profiles";

const emptyPipeline = (): PipelineRes => ({
  PROSPECT: [],
  CONSULTING: [],
  VIEWING: [],
  NEGOTIATION: [],
  DEPOSIT: [],
  CLOSED_WON: [],
  CLOSED_LOST: [],
});

const legacyStageMap: Partial<Record<string, DealStage>> = {
  QUALIFIED: "CONSULTING",
  PROPOSAL: "VIEWING",
};

type DealRow = {
  id: string;
  user_id: string;
  contact_id: string;
  title: string;
  value: number;
  stage: string;
  probability: number | null;
  priority: string | null;
  lead_source: string | null;
  property_project: string | null;
  property_type: string | null;
  property_code: string | null;
  property_area: string | null;
  appointment_date: string | null;
  lost_reason: string | null;
  close_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  contacts?: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    source: string | null;
    company: string | null;
    position: string | null;
  } | null;
  tasks?: Array<{ id: string; title: string; done: boolean; due_date: string | null; created_at: string }>;
  activities?: Array<{ id: string; type: string; title: string | null; note: string; date: string }>;
  ai_suggestions?: Array<{ id: string; type: string; content: string; created_at: string }>;
};

function mapDealCard(row: DealRow, owner: { id: string; name: string }): DealCard {
  const stage = legacyStageMap[row.stage] ?? (row.stage as DealStage);
  return {
    id: row.id,
    tenantId: row.user_id,
    contactId: row.contact_id,
    ownerId: row.user_id,
    title: row.title,
    value: Number(row.value ?? 0),
    stage,
    probability: Number(row.probability ?? 0),
    priority: row.priority,
    leadSource: row.lead_source,
    propertyProject: row.property_project,
    propertyType: row.property_type,
    propertyCode: row.property_code,
    propertyArea: row.property_area,
    appointmentDate: row.appointment_date ? new Date(row.appointment_date) : null,
    lostReason: row.lost_reason,
    closeDate: row.close_date ? new Date(row.close_date) : new Date(),
    note: row.note,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    contact: {
      id: row.contacts?.id ?? row.contact_id,
      name: row.contacts?.name ?? "Unknown contact",
      phone: row.contacts?.phone ?? null,
      source: row.contacts?.source ?? null,
    },
    owner,
  };
}

export async function getPipeline(): Promise<PipelineRes> {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const owner = await getCurrentOwner();
  const { data, error } = await supabase
    .from("deals")
    .select("*, contacts(id,name,email,phone,company,position,source)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const pipeline = emptyPipeline();

  for (const row of (data ?? []) as DealRow[]) {
    const stage = legacyStageMap[row.stage] ?? (row.stage as DealStage);
    pipeline[stage].push(mapDealCard(row, owner));
  }

  return pipeline;
}

export async function getDealById(id: string): Promise<DealDetail> {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const owner = await getCurrentOwner();
  const { data, error } = await supabase
    .from("deals")
    .select("*, contacts(id,name,email,phone,company,position,source), tasks(id,title,done,due_date,created_at), activities(id,type,title,note,date), ai_suggestions(id,type,content,created_at)")
    .eq("user_id", user.id)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const row = data as DealRow;
  const card = mapDealCard(row, owner);

  return {
    ...card,
    contact: {
      id: row.contacts?.id ?? row.contact_id,
      name: row.contacts?.name ?? "Unknown contact",
      email: row.contacts?.email ?? null,
      phone: row.contacts?.phone ?? null,
      source: row.contacts?.source ?? null,
      company: row.contacts?.company ?? null,
      position: row.contacts?.position ?? null,
    },
    owner,
    tasks: (row.tasks ?? []).map((task) => ({
      id: task.id,
      title: task.title,
      done: task.done,
      dueDate: task.due_date ? new Date(task.due_date) : null,
      createdAt: new Date(task.created_at),
    })),
    activities: (row.activities ?? []).map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title,
      note: activity.note,
      date: new Date(activity.date),
    })),
    aiSuggestions: (row.ai_suggestions ?? []).map((suggestion) => ({
      id: suggestion.id,
      type: suggestion.type,
      content: suggestion.content,
      createdAt: new Date(suggestion.created_at),
    })),
  };
}
