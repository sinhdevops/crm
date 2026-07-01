import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";

export async function getCurrentProfile() {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCurrentOwner() {
  const profile = await getCurrentProfile();

  return {
    id: profile.id,
    name: profile.name || profile.email,
    email: profile.email,
    role: profile.role,
    tenantId: profile.id,
  };
}
