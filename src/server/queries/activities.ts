import type {
  ActivityItem,
  GetActivitiesParamsType,
} from "@/lib/validations/activities.scheme";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";
import { getCurrentOwner } from "./profiles";

export async function getActivities(params: GetActivitiesParamsType = {}) {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const owner = await getCurrentOwner();
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("activities")
    .select("*, contacts(id,name,company), deals(id,title)", { count: "exact" })
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .range(from, to);

  if (params.type) query = query.eq("type", params.type);
  if (params.contactId) query = query.eq("contact_id", params.contactId);
  if (params.dealId) query = query.eq("deal_id", params.dealId);
  if (params.search?.trim()) query = query.ilike("note", `%${params.search.trim()}%`);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return {
    data: ((data ?? []) as any[]).map((row): ActivityItem => ({
      id: row.id,
      tenantId: row.user_id,
      contactId: row.contact_id,
      dealId: row.deal_id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      note: row.note,
      date: new Date(row.date),
      user: {
        id: owner.id,
        name: owner.name,
      },
      contact: row.contacts
        ? {
            id: row.contacts.id,
            name: row.contacts.name,
            company: row.contacts.company,
          }
        : null,
      deal: row.deals
        ? {
            id: row.deals.id,
            title: row.deals.title,
          }
        : null,
    })),
    total: count ?? 0,
    page,
    limit,
  };
}
