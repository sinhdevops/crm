"use client";

import { activityKeys } from "@/hooks/useActivities";
import { useTableRealtime } from "./useTableRealtime";

export function useActivitiesRealtime() {
  useTableRealtime("activities", activityKeys.all);
}
