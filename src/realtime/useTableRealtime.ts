"use client";

import { useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

type RealtimeTable = "contacts" | "deals" | "activities";

export function useTableRealtime(table: RealtimeTable, queryKey: readonly unknown[]) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      const channel = supabase
        .channel(`${table}:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey });
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    let cleanup: (() => void) | undefined;
    subscribe().then((value) => {
      cleanup = value;
    });

    return () => {
      active = false;
      cleanup?.();
    };
  }, [queryClient, queryKey, table]);
}
