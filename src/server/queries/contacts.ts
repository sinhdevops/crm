import type {
  Contact,
  GetContactsQueryType,
  GetContactResType,
  GetContactWithDealsActivitiesResType,
} from "@/lib/validations/contacts.scheme";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";

type ContactRow = {
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
  deleted_at: string | null;
};

function mapContact(row: ContactRow): Contact {
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

export async function getContacts(params: GetContactsQueryType = { limit: 10 }) {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const limit = params.limit ?? 10;

  let query = supabase
    .from("contacts")
    .select("*, deals(id,value), activities(id,date)")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(limit + 1);

  if (params.cursor) {
    query = query.lt("updated_at", params.cursor);
  }

  if (params.search?.trim()) {
    const search = `%${params.search.trim()}%`;
    query = query.or(`name.ilike.${search},email.ilike.${search},phone.ilike.${search},zalo.ilike.${search},facebook.ilike.${search},residence.ilike.${search},area_interest.ilike.${search},source.ilike.${search},decision_maker.ilike.${search},note.ilike.${search}`);
  }

  if (params.customerType) {
    query = query.eq("customer_type", params.customerType);
  }

  if (params.purchaseNeed) {
    query = query.eq("purchase_need", params.purchaseNeed);
  }

  if (params.interestType) {
    query = query.eq("interest_type", params.interestType);
  }

  if (params.source) {
    query = query.eq("source", params.source);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as Array<ContactRow & {
    deals: Array<{ id: string; value: number }>;
    activities: Array<{ id: string; date: string }>;
  }>;
  const pageRows = rows.slice(0, limit);

  return {
    data: pageRows.map((row): GetContactWithDealsActivitiesResType => ({
      ...mapContact(row),
      deals: row.deals ?? [],
      activities: (row.activities ?? []).map((activity) => ({
        id: activity.id,
        date: new Date(activity.date),
      })),
    })),
    pagination: {
      nextCursor: rows.length > limit ? pageRows.at(-1)?.updated_at ?? null : null,
      hasNextPage: rows.length > limit,
    },
  };
}

export async function getContactById(id: string): Promise<GetContactResType> {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("contacts")
    .select("*, deals(id,title,stage,value), activities(id,type,note,date)")
    .eq("user_id", user.id)
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...mapContact(data as ContactRow),
    deals: ((data as any).deals ?? []).map((deal: any) => ({
      id: deal.id,
      title: deal.title,
      stage: deal.stage,
      value: Number(deal.value ?? 0),
    })),
    activities: ((data as any).activities ?? []).map((activity: any) => ({
      id: activity.id,
      type: activity.type,
      note: activity.note,
      date: new Date(activity.date),
    })),
  };
}
