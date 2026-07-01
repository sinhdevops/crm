"use client";

import {
  deleteUserAction,
  getUsersAction,
  updateUserAction,
} from "@/app/(dashboard)/settings/actions";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
};

export const useGetUsers = () => {
  return useQuery({
    queryKey: userKeys.lists(),
    queryFn: getUsersAction,
    staleTime: 30_000,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, name, role }: { id: string; name?: string; role?: string }) =>
      updateUserAction(id, { name, role }),
    onSuccess: () => {
      toast.success("Cap nhat thong tin thanh cong");
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể cập nhật thành viên.");
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (_id?: string) => deleteUserAction(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Không thể xóa thành viên.");
    },
  });
};
