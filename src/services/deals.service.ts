import {
  analyzeDealAction,
  createDealAction,
  createTaskAction,
  createTasksBulkAction,
  deleteDealAction,
  deleteTaskAction,
  getDealByIdAction,
  getPipelineAction,
  updateDealAction,
  updateDealStageAction,
  updateTaskAction,
} from "@/app/(dashboard)/pipeline/actions";
import type {
  CreateDealBodyType,
  DealCard,
  DealDetail,
  PipelineRes,
  UpdateDealBodyType,
  UpdateDealStageBodyType,
} from "@/lib/validations/deals.schema";

export const dealsService = {
  getPipeline: async (): Promise<PipelineRes> => getPipelineAction(),

  getById: async (id: string): Promise<DealDetail> => getDealByIdAction(id),

  create: async (data: CreateDealBodyType): Promise<DealCard> =>
    createDealAction(data) as unknown as Promise<DealCard>,

  updateStage: async (
    id: string,
    data: UpdateDealStageBodyType,
  ): Promise<DealCard> => updateDealStageAction(id, data) as unknown as Promise<DealCard>,

  update: async (id: string, data: UpdateDealBodyType): Promise<DealCard> =>
    updateDealAction(id, data) as unknown as Promise<DealCard>,

  delete: async (id: string): Promise<void> => {
    await deleteDealAction(id);
  },

  analyze: async (
    id: string,
    meetingNote: string,
  ): Promise<{
    tasks: Array<{ title: string; dueDate?: string | null }>;
    emailDraft: string;
  }> => analyzeDealAction(id, meetingNote),

  createTask: async (dealId: string, title: string, dueDate?: string | null) =>
    createTaskAction(dealId, title, dueDate),

  createTasksBulk: async (
    dealId: string,
    tasks: Array<{ title: string; dueDate?: string | null }>,
  ) => createTasksBulkAction(dealId, tasks),

  updateTask: async (
    dealId: string,
    taskId: string,
    data: { title?: string; done?: boolean; dueDate?: string | null },
  ) => updateTaskAction(dealId, taskId, data),

  deleteTask: async (dealId: string, taskId: string) =>
    deleteTaskAction(dealId, taskId),
};
