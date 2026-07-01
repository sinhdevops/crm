import {
  getActivitiesReportAction,
  getPipelineAnalysisAction,
  getReportsOverviewAction,
  getTeamPerformanceAction,
  updateKpiTargetAction,
} from "@/app/(dashboard)/analytics-actions";

export interface DateParams {
  startDate?: string;
  endDate?: string;
}

export interface KpiVal {
  value: number;
  delta: string;
  up: boolean;
  subtext?: string;
}

export interface OverviewRes {
  kpis: {
    totalRevenue: KpiVal;
    closedDeals: KpiVal;
    winRate: KpiVal;
    avgDealSize: KpiVal;
    avgDaysToClose: KpiVal;
  };
  revenueByMonth: {
    month: string;
    actual: number;
    target: number;
  }[];
  forecastData: {
    month: string;
    cumActual: number;
    cumForecast: number;
  }[];
  winLossData: {
    stage: string;
    win: number;
    loss: number;
  }[];
  topDeals: {
    id: string;
    name: string;
    company: string;
    owner: {
      id: string;
      name: string;
    };
    value: number;
    closedAt: string;
    stage: string;
  }[];
}

export interface TeamRepPerformance {
  userId: string;
  name: string;
  actual: number;
  target: number;
  winRate: number;
  activities: number;
  avgDaysToClose: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  percentage: number;
  color: string;
}

export interface PipelineAnalysisRes {
  conversionFunnel: FunnelStage[];
  bottlenecks: {
    type: "warning" | "success";
    title: string;
    description: string;
  }[];
  averageWinVelocity: string;
  weightedForecast: {
    month: string;
    actual?: number;
    forecast?: number;
    target?: number;
  }[];
}

export interface ActivitiesReportRes {
  trend: {
    name: string;
    Calls: number;
    Emails: number;
    Meetings: number;
    Tasks: number;
  }[];
  statusDistribution: {
    name: string;
    value: number;
  }[];
}

export const reportsService = {
  getOverview: async (params?: DateParams): Promise<OverviewRes> => {
    return getReportsOverviewAction(params);
  },

  getTeamPerformance: async (params?: DateParams): Promise<TeamRepPerformance[]> => {
    return getTeamPerformanceAction(params);
  },

  updateKpiTarget: async (_data: {
    userId: string;
    target: number;
    month: number;
    year: number;
  }) => {
    return updateKpiTargetAction();
  },

  getPipelineAnalysis: async (): Promise<PipelineAnalysisRes> => {
    return getPipelineAnalysisAction();
  },

  getActivities: async (params?: DateParams): Promise<ActivitiesReportRes> => {
    return getActivitiesReportAction(params);
  },
};


