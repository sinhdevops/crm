"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, BellRing, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { activityKeys } from "@/hooks/useActivities";
import { contactKeys } from "@/hooks/useContacts";
import { dealKeys } from "@/hooks/useDeals";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type RealtimeTable = "contacts" | "deals" | "activities";
type RealtimeRow<TTable extends RealtimeTable> =
  Database["public"]["Tables"][TTable]["Row"];

const NOTIFICATION_STORAGE_KEY = "salesflow-notification-prompt-dismissed";

const tableLabels: Record<RealtimeTable, string> = {
  contacts: "liên hệ mới",
  deals: "deal mới",
  activities: "hoạt động mới",
};

function getNotificationText<TTable extends RealtimeTable>(
  table: TTable,
  row: RealtimeRow<TTable>,
) {
  if (table === "contacts") {
    const contact = row as RealtimeRow<"contacts">;
    return {
      title: "Có liên hệ mới",
      body: contact.name || "Một liên hệ mới vừa được thêm vào CRM.",
      url: "/contacts",
    };
  }

  if (table === "deals") {
    const deal = row as RealtimeRow<"deals">;
    return {
      title: "Có deal mới",
      body: deal.title || "Một deal mới vừa được thêm vào pipeline.",
      url: "/pipeline",
    };
  }

  const activity = row as RealtimeRow<"activities">;
  return {
    title: "Có hoạt động mới",
    body: activity.title || activity.note || "Một hoạt động mới vừa được ghi nhận.",
    url: "/activities",
  };
}

function invalidateTable(queryClient: ReturnType<typeof useQueryClient>, table: RealtimeTable) {
  if (table === "contacts") {
    queryClient.invalidateQueries({ queryKey: contactKeys.all });
    return;
  }

  if (table === "deals") {
    queryClient.invalidateQueries({ queryKey: dealKeys.all });
    return;
  }

  queryClient.invalidateQueries({ queryKey: activityKeys.all });
}

function canUseBrowserNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function showSystemNotification(title: string, body: string, url: string) {
  if (!canUseBrowserNotifications() || Notification.permission !== "granted") {
    return false;
  }

  const notification = new Notification(title, {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: `salesflow-${url}`,
  });

  notification.onclick = () => {
    window.focus();
    window.location.href = url;
    notification.close();
  };

  return true;
}

export function RealtimeNotifications() {
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    "unsupported",
  );
  const [dismissed, setDismissed] = useState(true);

  const shouldShowPrompt = useMemo(
    () => permission === "default" && !dismissed,
    [dismissed, permission],
  );

  useEffect(() => {
    if (!canUseBrowserNotifications()) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);
    setDismissed(localStorage.getItem(NOTIFICATION_STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    let active = true;

    async function subscribe() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active || !user) return;

      const channel = supabase.channel(`notifications:${user.id}`);

      (["contacts", "deals", "activities"] as RealtimeTable[]).forEach((table) => {
        channel.on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            invalidateTable(queryClient, table);

            const { title, body, url } = getNotificationText(
              table,
              payload.new as RealtimeRow<typeof table>,
            );
            const shownInSystem = showSystemNotification(title, body, url);

            toast.info(title, {
              description: body,
              action: {
                label: "Xem",
                onClick: () => {
                  window.location.href = url;
                },
              },
            });

            if (!shownInSystem && canUseBrowserNotifications() && Notification.permission === "default") {
              setPermission("default");
              setDismissed(localStorage.getItem(NOTIFICATION_STORAGE_KEY) === "true");
            }
          },
        );
      });

      channel.subscribe();

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
  }, [queryClient]);

  async function enableNotifications() {
    if (!canUseBrowserNotifications()) {
      toast.error("Trình duyệt này chưa hỗ trợ thông báo web.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      setDismissed(false);
      toast.success("Đã bật thông báo trên trình duyệt.");
      showSystemNotification(
        "SalesFlow đã bật thông báo",
        "Khi có tin mới, bạn sẽ nhận được thông báo ở điện thoại.",
        "/today",
      );
      return;
    }

    if (result === "denied") {
      toast.error("Bạn đã chặn thông báo. Hãy bật lại trong cài đặt trình duyệt.");
    }
  }

  function dismissPrompt() {
    localStorage.setItem(NOTIFICATION_STORAGE_KEY, "true");
    setDismissed(true);
  }

  if (!shouldShowPrompt) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[90] md:inset-x-auto md:right-5 md:bottom-5">
      <div className="mx-auto flex max-w-md items-start gap-3 rounded-xl border border-border bg-background p-3 shadow-lg shadow-black/10 md:w-[360px]">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
          <BellRing size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Bật thông báo tin mới</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Khi có {Object.values(tableLabels).join(", ")} bạn sẽ nhận thông báo trên điện thoại.
          </p>
          <div className="mt-3 flex gap-2">
            <Button type="button" size="md" className="text-xs sm:h-8 sm:rounded-lg sm:px-3" onClick={enableNotifications}>
              <Bell size={13} />
              Bật thông báo
            </Button>
            <Button type="button" size="md" variant="ghost" className="text-xs sm:h-8 sm:rounded-lg sm:px-3" onClick={dismissPrompt}>
              Để sau
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Ẩn gợi ý bật thông báo"
          onClick={dismissPrompt}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
