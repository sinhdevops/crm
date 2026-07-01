"use client";

import { useEffect } from "react";
import {
  createDealAction,
  deleteDealAction,
  getDealByIdAction,
  getPipelineAction,
  updateDealAction,
  updateDealStageAction,
} from "@/app/(dashboard)/pipeline/actions";
import { useDealPipelineStore } from "@/stores/dealCards-store";
import type {
  CreateDealBodyType,
  DealStage,
  UpdateDealBodyType,
  UpdateDealStageBodyType,
} from "@/lib/validations/deals.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const dealKeys = {
  all: ["deals"] as const,
  pipeline: () => [...dealKeys.all, "pipeline"] as const,
  details: () => [...dealKeys.all, "detail"] as const,
  detail: (id: string) => [...dealKeys.details(), id] as const,
};

export const useGetPipeline = () => {
  const { setPipeline, setLoading, setError } = useDealPipelineStore();

  const query = useQuery({
    queryKey: dealKeys.pipeline(),
    queryFn: getPipelineAction,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setPipeline(query.data);
      setError(null);
    }
  }, [query.data, setError, setPipeline]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.error) {
      setError((query.error as Error).message ?? "Lỗi tải quy trình bán hàng");
    }
  }, [query.error, setError]);

  return query;
};

export const useGetDealDetail = (id: string) => {
  return useQuery({
    queryKey: dealKeys.detail(id),
    queryFn: () => getDealByIdAction(id),
    enabled: !!id,
    staleTime: 30_000,
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDealBodyType) => createDealAction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.pipeline() });
      toast.success("Tạo deal thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Tạo deal thất bại");
    },
  });
};

export const useUpdateDealStage = () => {
  const queryClient = useQueryClient();
  const { rollbackMoveDeal } = useDealPipelineStore();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      from: DealStage;
      to: DealStage;
      data: UpdateDealStageBodyType;
    }) => updateDealStageAction(id, data),
    onError: (error: Error, { id, from, to }) => {
      rollbackMoveDeal(id, from, to);
      toast.error(error.message || "Cập nhật giai đoạn thất bại");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.pipeline() });
    },
  });
};

export const useUpdateDeal = (dealId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateDealBodyType) => updateDealAction(dealId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.pipeline() });
      queryClient.invalidateQueries({ queryKey: dealKeys.detail(dealId) });
      toast.success("Cập nhật deal thành công");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Cập nhật deal thất bại");
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  const { removeDeal } = useDealPipelineStore();

  return useMutation({
    mutationFn: ({ id }: { id: string; stage: DealStage }) => deleteDealAction(id),
    onMutate: ({ id, stage }) => {
      removeDeal(id, stage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dealKeys.pipeline() });
      toast.success("Xóa deal thành công");
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: dealKeys.pipeline() });
      toast.error(error.message || "Xóa deal thất bại");
    },
  });
};
