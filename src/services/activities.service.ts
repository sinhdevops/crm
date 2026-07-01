import {
  createContactActivityAction,
  createDealActivityAction,
  deleteActivityAction,
  getActivitiesAction,
  updateActivityAction,
} from "@/app/(dashboard)/activities/actions";
import type {
  CreateActivityForContactBodyType,
  CreateActivityForDealBodyType,
  GetActivitiesListResType,
  GetActivitiesPaginatedResType,
  GetActivitiesParamsType,
  UpdateActivityBodyType,
} from "@/lib/validations/activities.scheme";

export const activitiesService = {
  getAll: async (
    params?: GetActivitiesParamsType,
  ): Promise<GetActivitiesPaginatedResType> => getActivitiesAction(params),
  getByContact: async (contactId: string): Promise<GetActivitiesListResType> => {
    const res = await getActivitiesAction({ contactId });
    return { data: res.data };
  },
  getByDeal: async (dealId: string): Promise<GetActivitiesListResType> => {
    const res = await getActivitiesAction({ dealId });
    return { data: res.data };
  },
  createForContact: async (
    contactId: string,
    body: CreateActivityForContactBodyType,
  ) => createContactActivityAction(contactId, body),
  createForDeal: async (dealId: string, body: CreateActivityForDealBodyType) =>
    createDealActivityAction(dealId, body),
  update: async (activityId: string, body: UpdateActivityBodyType) =>
    updateActivityAction(activityId, body),
  delete: async (activityId: string) => deleteActivityAction(activityId),
};
