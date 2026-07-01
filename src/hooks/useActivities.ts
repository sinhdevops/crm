"use client";

import {
  createContactActivityAction,
  createDealActivityAction,
  deleteActivityAction,
  getActivitiesAction,
  updateActivityAction,
} from "@/app/(dashboard)/activities/actions";
import {
  ActivityType,
  type CreateActivityForContactBodyType,
  type CreateActivityForDealBodyType,
  type GetActivitiesParamsType,
  type UpdateActivityBodyType,
} from "@/lib/validations/activities.scheme";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const activityKeys = {
  all: ["activities"] as const,
  lists: () => [...activityKeys.all, "list"] as const,
  list: (params?: GetActivitiesParamsType) => [...activityKeys.lists(), params] as const,
  infinite: (params?: Omit<GetActivitiesParamsType, "page">) =>
    [...activityKeys.all, "infinite", params] as const,
  byContact: (contactId: string) => [...activityKeys.all, "contact", contactId] as const,
  byDeal: (dealId: string) => [...activityKeys.all, "deal", dealId] as const,
};

export const useActivities = (params?: GetActivitiesParamsType) => {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => getActivitiesAction(params),
    staleTime: 30_000,
  });
};

export const useActivitiesInfinite = (
  params?: Omit<GetActivitiesParamsType, "page">,
) => {
  return useInfiniteQuery({
    queryKey: activityKeys.infinite(params),
    queryFn: ({ pageParam = 1 }) =>
      getActivitiesAction({ ...params, page: pageParam as number }),
    staleTime: 30_000,
    initialPageParam: 1 as number,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
};

export const useContactActivities = (contactId: string) => {
  return useQuery({
    queryKey: activityKeys.byContact(contactId),
    queryFn: () => getActivitiesAction({ contactId }),
    enabled: !!contactId,
    staleTime: 30_000,
    select: (data) => data.data,
  });
};

export const useDealActivities = (dealId: string) => {
  return useQuery({
    queryKey: activityKeys.byDeal(dealId),
    queryFn: () => getActivitiesAction({ dealId }),
    enabled: !!dealId,
    staleTime: 30_000,
    select: (data) => data.data,
  });
};

export const useCreateContactActivity = (contactId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateActivityForContactBodyType) =>
      createContactActivityAction(contactId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      toast.success("Tạo hoạt động thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo hoạt động thất bại");
    },
  });
};

export const useCreateDealActivity = (dealId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateActivityForDealBodyType) =>
      createDealActivityAction(dealId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      toast.success("Tạo hoạt động thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo hoạt động thất bại");
    },
  });
};

export const useUpdateActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateActivityBodyType }) =>
      updateActivityAction(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      toast.success("Cập nhật hoạt động thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật hoạt động thất bại");
    },
  });
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (activityId: string) => deleteActivityAction(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: activityKeys.all });
      toast.success("Xóa hoạt động thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Xóa hoạt động thất bại");
    },
  });
};

export { ActivityType };
