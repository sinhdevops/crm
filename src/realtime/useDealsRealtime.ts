"use client";

import { dealKeys } from "@/hooks/useDeals";
import { useTableRealtime } from "./useTableRealtime";

export function useDealsRealtime() {
  useTableRealtime("deals", dealKeys.all);
}
