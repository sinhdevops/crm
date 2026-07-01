import { getDashboardDataAction } from "@/app/(dashboard)/analytics-actions";
import type { DashboardPeriod, DashboardRes } from "@/lib/validations/dashboard.schema";

export const dashboardService = {
  getDashboardData: async (period: DashboardPeriod): Promise<DashboardRes> => {
    return getDashboardDataAction(period);
  },
};
