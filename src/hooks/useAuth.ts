"use client";

import { loginAction, logoutAction, registerAction } from "@/app/(auth)/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LoginBodyType, RegisterBodyType } from "@/lib/validations/auth.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: LoginBodyType) => loginAction(data),
    onSuccess: () => {
      toast.success("Đăng nhập thành công");
      router.push("/today");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đăng nhập thất bại");
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => logoutAction(),
    onSuccess: () => {
      toast.success("Đăng xuất thành công");
    },
  });
};

export const useRegister = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: RegisterBodyType) => registerAction(data),
    onSuccess: () => {
      toast.success("Đăng ký thành công. Vui lòng đăng nhập.");
      router.push("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Đăng ký thất bại");
    },
  });
};

export const useMe = () => {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: userData, error } = await supabase.auth.getUser();
      if (error || !userData.user) throw error ?? new Error("Unauthenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      return {
        id: userData.user.id,
        email: userData.user.email ?? "",
        name: profile?.name ?? userData.user.email ?? "",
        role: profile?.role ?? "ADMIN",
        tenantId: userData.user.id,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
