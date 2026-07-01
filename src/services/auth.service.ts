import { loginAction, logoutAction, registerAction } from "@/app/(auth)/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RegisterBodyType } from "@/lib/validations/auth.schema";
import type { LoginFormValues } from "@/types/auth.type";

export const authService = {
  login: async (values: LoginFormValues) => loginAction(values),
  logout: async () => logoutAction(),
  register: async (values: RegisterBodyType) => registerAction(values),
  me: async () => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) throw error ?? new Error("Unauthenticated");

    return {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? user.email ?? "",
      role: "ADMIN",
      tenantId: user.id,
    };
  },
};
