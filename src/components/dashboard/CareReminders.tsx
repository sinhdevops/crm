import { BellRing, CalendarDays, Cake, CreditCard, PhoneCall } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { CareReminderType } from "@/lib/validations/dashboard.schema";
import { cn } from "@/lib/utils";

type CareRemindersProps = {
  reminders?: CareReminderType[];
  isLoading?: boolean;
};

const typeConfig = {
  BIRTHDAY: {
    label: "Sinh nhật",
    icon: Cake,
    bg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-700",
  },
  PAYMENT: {
    label: "Đóng tiền",
    icon: CreditCard,
    bg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  FOLLOW_UP: {
    label: "Chăm khách",
    icon: PhoneCall,
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-700",
  },
} as const;

const severityConfig = {
  overdue: {
    label: "Quá hạn",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  critical: {
    label: "Gấp",
    className: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
  },
  urgent: {
    label: "Còn 1 tuần",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  soon: {
    label: "Còn 1 tháng",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  normal: {
    label: "Sắp tới",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
} as const;

function formatDueDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CareReminders({
  reminders = [],
  isLoading = false,
}: CareRemindersProps) {
  return (
    <Card className="gap-0 border-border/70 py-0 shadow-none">
      <CardHeader className="border-b px-5 py-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm tracking-tight">
            <BellRing className="size-4 text-primary" />
            Nhắc chăm khách
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            Sinh nhật, lịch chăm và hạn đóng tiền cần xử lý
          </CardDescription>
        </div>
      </CardHeader>

      {isLoading ? (
        <CardContent className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="rounded-lg border border-border/70 p-3">
              <Skeleton className="mb-3 h-4 w-24" />
              <Skeleton className="mb-2 h-3 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </CardContent>
      ) : reminders.length === 0 ? (
        <CardContent className="flex items-center justify-center py-8 text-center">
          <div>
            <CalendarDays className="mx-auto mb-2 size-8 text-muted-foreground/40" />
            <p className="text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>
              Chưa có việc chăm khách sắp tới
            </p>
            <p className="mt-1 text-muted-foreground" style={{ fontSize: 12 }}>
              Khi gần sinh nhật, hạn đóng tiền hoặc lịch chăm, hệ thống sẽ nhắc tại đây.
            </p>
          </div>
        </CardContent>
      ) : (
        <CardContent className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2 xl:grid-cols-4">
          {reminders.map((reminder) => {
            const type = typeConfig[reminder.type];
            const severity = severityConfig[reminder.severity];
            const Icon = type.icon;

            return (
              <Link
                key={reminder.id}
                href={`/contacts/${reminder.contactId}`}
                className={cn(
                  "rounded-lg border p-3 transition-colors hover:bg-muted/30",
                  type.bg,
                  severity.className,
                )}
                style={{ textDecoration: "none" }}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-md",
                        type.iconBg,
                        type.iconColor,
                      )}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p
                        className="truncate text-foreground"
                        style={{ fontSize: 13, fontWeight: 600 }}
                      >
                        {reminder.contactName}
                      </p>
                      <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                        {type.label}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 gap-1 border", severity.className)}>
                    <span className={cn("size-1.5 rounded-full", severity.dot)} />
                    {severity.label}
                  </Badge>
                </div>

                <p className="text-foreground" style={{ fontSize: 12, fontWeight: 500 }}>
                  {reminder.title}
                </p>
                <p className="mt-1 text-muted-foreground" style={{ fontSize: 11 }}>
                  {reminder.description}
                </p>
                <p className="mt-2 text-muted-foreground" style={{ fontSize: 11 }}>
                  Hạn: {formatDueDate(reminder.dueDate)}
                  {reminder.contactPhone ? ` - ${reminder.contactPhone}` : ""}
                </p>
              </Link>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
