"use client";

import {
  createContactAction,
  deleteContactAction,
  getContactByIdAction,
  getContactsAction,
  updateContactAction,
} from "@/app/(dashboard)/contacts/actions";
import type {
  CreateContactBodyType,
  GetContactsQueryType,
  UpdateContactBodyType,
} from "@/lib/validations/contacts.scheme";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const contactKeys = {
  all: ["contacts"] as const,
  lists: () => [...contactKeys.all, "list"] as const,
  list: (params: GetContactsQueryType) => [...contactKeys.lists(), params] as const,
  detail: (id: string) => [...contactKeys.all, "detail", id] as const,
};

export const useGetContacts = (
  params: GetContactsQueryType,
  initialPage?: Awaited<ReturnType<typeof getContactsAction>>,
) => {
  return useInfiniteQuery({
    queryKey: contactKeys.list(params),
    queryFn: ({ pageParam }) =>
      getContactsAction({
        ...params,
        cursor: pageParam as string | undefined,
      }),
    staleTime: 30_000,
    initialPageParam: undefined as string | undefined,
    initialData: initialPage
      ? {
          pages: [initialPage],
          pageParams: [undefined],
        }
      : undefined,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.nextCursor ?? undefined
        : undefined,
  });
};

export const useGetContact = (id: string) => {
  return useQuery({
    queryKey: contactKeys.detail(id),
    queryFn: () => getContactByIdAction(id),
    enabled: !!id,
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactBodyType) => createContactAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success("Tạo liên hệ thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo liên hệ thất bại");
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactBodyType }) =>
      updateContactAction(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success("Cập nhật thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật thất bại");
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteContactAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      toast.success("Xóa liên hệ thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa thất bại");
    },
  });
};
