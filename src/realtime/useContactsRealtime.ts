"use client";

import { contactKeys } from "@/hooks/useContacts";
import { useTableRealtime } from "./useTableRealtime";

export function useContactsRealtime() {
  useTableRealtime("contacts", contactKeys.all);
}
