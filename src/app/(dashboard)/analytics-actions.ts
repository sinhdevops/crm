"use server";

import type { DashboardPeriod } from "@/lib/validations/dashboard.schema";
import type { DateParams } from "@/services/reports.service";
import {
  getActivitiesReport,
  getDashboardData,
  getPipelineAnalysis,
  getReportsOverview,
  getTeamPerformance,
} from "@/server/queries/analytics";

export async function getDashboardDataAction(period: DashboardPeriod) {
  return getDashboardData(period);
}

export async function getReportsOverviewAction(params?: DateParams) {
  return getReportsOverview(params);
}

export async function getTeamPerformanceAction(params?: DateParams) {
  return getTeamPerformance(params);
}

export async function updateKpiTargetAction() {
  return { ok: true };
}

export async function getPipelineAnalysisAction() {
  return getPipelineAnalysis();
}

export async function getActivitiesReportAction(params?: DateParams) {
  return getActivitiesReport(params);
}
