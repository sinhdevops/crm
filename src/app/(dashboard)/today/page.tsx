import Link from "next/link";
import {
  BellRing,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Filter,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Plus,
  Send,
  Users,
} from "lucide-react";

import { getTodayCareReminders } from "@/server/queries/analytics";
import type { CareReminderType } from "@/lib/validations/dashboard.schema";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const scheduleTimes = ["09:00", "10:00", "11:30", "14:00", "15:30", "16:30", "18:00", "19:00"];
const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const typeConfig = {
  BIRTHDAY: {
    label: "Nhắn tin",
    icon: MessageSquare,
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    actionIcon: MessageSquare,
  },
  PAYMENT: {
    label: "Thanh toán",
    icon: CreditCard,
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    actionIcon: CalendarCheck,
  },
  FOLLOW_UP: {
    label: "Gọi điện",
    icon: Phone,
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    actionIcon: Phone,
  },
} as const;

const priorityConfig = {
  high: {
    label: "Cao",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  medium: {
    label: "Trung bình",
    className: "border-orange-200 bg-orange-50 text-orange-700",
  },
  low: {
    label: "Thấp",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
} as const;

const statusConfig = {
  overdue: {
    label: "Quá hạn",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  today: {
    label: "Hôm nay",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  pending: {
    label: "Đang chờ",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
} as const;

function formatHeaderDate(date: Date) {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function getPriority(reminder: CareReminderType): keyof typeof priorityConfig {
  if (reminder.severity === "overdue" || reminder.severity === "critical") return "high";
  if (reminder.severity === "urgent") return "medium";
  return "low";
}

function getStatus(reminder: CareReminderType): keyof typeof statusConfig {
  if (reminder.daysUntil < 0) return "overdue";
  if (reminder.daysUntil <= 1) return "today";
  return "pending";
}

function getScheduleTime(reminder: CareReminderType, index: number) {
  if (reminder.daysUntil > 1) return formatShortDate(reminder.dueDate);
  return scheduleTimes[index % scheduleTimes.length];
}

function buildCalendarDays(currentDate: Date, reminders: CareReminderType[]) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const start = new Date(year, month, 1 - startOffset);
  const dueDays = new Set(
    reminders
      .filter((item) => {
        const due = new Date(item.dueDate);
        return due.getFullYear() === year && due.getMonth() === month;
      })
      .map((item) => new Date(item.dueDate).getDate()),
  );

  return Array.from({ length: 35 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      inMonth: date.getMonth() === month,
      isToday: date.toDateString() === currentDate.toDateString(),
      hasReminder: date.getMonth() === month && dueDays.has(date.getDate()),
    };
  });
}

function groupByContact(reminders: CareReminderType[]) {
  const grouped = new Map<string, { name: string; contactId: string; count: number; nearest: number }>();

  for (const reminder of reminders) {
    const current = grouped.get(reminder.contactId);
    if (current) {
      current.count += 1;
      current.nearest = Math.min(current.nearest, reminder.daysUntil);
    } else {
      grouped.set(reminder.contactId, {
        name: reminder.contactName,
        contactId: reminder.contactId,
        count: 1,
        nearest: reminder.daysUntil,
      });
    }
  }

  return Array.from(grouped.values())
    .sort((a, b) => a.nearest - b.nearest || b.count - a.count)
    .slice(0, 3);
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  className,
}: {
  icon: typeof Clock3;
  label: string;
  value: number;
  note: string;
  className: string;
}) {
  return (
    <Card className="border-border/70 shadow-sm shadow-black/[0.02]">
      <CardContent className="flex items-center gap-4 p-5">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", className)}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-foreground" style={{ fontSize: 13, fontWeight: 650 }}>
            {label}
          </p>
          <p className={cn("mt-1 leading-none", className.split(" ").slice(-1)[0])} style={{ fontSize: 28, fontWeight: 800 }}>
            {value}
          </p>
          <p className="mt-2 text-muted-foreground" style={{ fontSize: 12 }}>
            {note}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function ScheduleTable({ reminders }: { reminders: CareReminderType[] }) {
  const rows = reminders.slice(0, 8);

  return (
    <Card className="border-border/70 shadow-sm shadow-black/[0.02]">
      <CardHeader className="border-b px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Lịch trình hôm nay ({rows.length})</CardTitle>
          <div className="flex items-center gap-5 overflow-x-auto pb-1 text-muted-foreground sm:gap-6 sm:overflow-visible" style={{ fontSize: 13 }}>
            {["Tất cả", "Gọi điện", "Gặp mặt", "Nhắn tin", "Khác"].map((item, index) => (
              <span
                key={item}
                className={cn(
                  "border-b-2 pb-2",
                  index === 0 ? "border-primary text-primary" : "border-transparent",
                )}
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CheckCircle2 className="mb-3 size-9 text-emerald-600" />
            <p className="text-foreground" style={{ fontSize: 15, fontWeight: 650 }}>
              Hôm nay chưa có lịch cần xử lý
            </p>
            <p className="mt-1 text-muted-foreground" style={{ fontSize: 13 }}>
              Khi có sinh nhật, hạn đóng tiền hoặc lịch chăm khách, hệ thống sẽ đưa vào đây.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr className="border-b text-left text-muted-foreground" style={{ fontSize: 12 }}>
                  <th className="px-6 py-4 font-semibold">Thời gian</th>
                  <th className="px-4 py-4 font-semibold">Khách hàng</th>
                  <th className="px-4 py-4 font-semibold">Nội dung</th>
                  <th className="px-4 py-4 font-semibold">Loại</th>
                  <th className="px-4 py-4 font-semibold">Ưu tiên</th>
                  <th className="px-4 py-4 font-semibold">Trạng thái</th>
                  <th className="px-4 py-4 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((reminder, index) => {
                  const type = typeConfig[reminder.type];
                  const TypeIcon = type.icon;
                  const ActionIcon = type.actionIcon;
                  const priority = priorityConfig[getPriority(reminder)];
                  const status = statusConfig[getStatus(reminder)];

                  return (
                    <tr key={reminder.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="px-6 py-4 text-blue-700" style={{ fontSize: 13, fontWeight: 700 }}>
                        {getScheduleTime(reminder, index)}
                      </td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/contacts/${reminder.contactId}`}
                          className="flex items-center gap-3"
                          style={{ textDecoration: "none" }}
                        >
                          <Avatar className="size-9">
                            <AvatarFallback className="bg-blue-50 text-blue-700" style={{ fontSize: 11, fontWeight: 700 }}>
                              {getInitials(reminder.contactName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-foreground" style={{ fontSize: 13, fontWeight: 650 }}>
                              {reminder.contactName}
                            </p>
                            <p className="text-muted-foreground" style={{ fontSize: 12 }}>
                              {reminder.contactPhone ?? "Chưa có SĐT"}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="max-w-[260px] px-4 py-4">
                        <p className="text-foreground" style={{ fontSize: 13, fontWeight: 500 }}>
                          {reminder.title}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-muted-foreground" style={{ fontSize: 12 }}>
                          {reminder.description}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={cn("size-8 rounded-full p-0", type.badgeClass)}>
                          <TypeIcon className="size-4" />
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={priority.className}>
                          {priority.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="icon-sm">
                            <Link href={`/contacts/${reminder.contactId}`}>
                              <ActionIcon className="size-3.5" />
                            </Link>
                          </Button>
                          <Button asChild variant="outline" size="icon-sm">
                            <Link href={`/contacts/${reminder.contactId}`}>
                              <MoreHorizontal className="size-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {rows.length > 0 ? (
          <div className="border-t py-5 text-center">
            <Link href="/activities" className="text-primary" style={{ fontSize: 13, fontWeight: 650, textDecoration: "none" }}>
              Xem tất cả lịch trình
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CalendarPanel({ reminders, currentDate }: { reminders: CareReminderType[]; currentDate: Date }) {
  const days = buildCalendarDays(currentDate, reminders);
  const monthLabel = currentDate.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });

  return (
    <Card className="border-border/70 shadow-sm shadow-black/[0.02]">
      <CardHeader className="px-5 py-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Lịch {monthLabel}</CardTitle>
          <div className="flex gap-1 text-muted-foreground">
            <ChevronLeft className="size-4" />
            <ChevronRight className="size-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        <div className="grid grid-cols-7 gap-1 text-center text-muted-foreground" style={{ fontSize: 12 }}>
          {weekdays.map((day) => (
            <div key={day} className="py-1 font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center" style={{ fontSize: 12 }}>
          {days.map((day) => (
            <div
              key={day.date.toISOString()}
              className={cn(
                "relative flex h-8 items-center justify-center rounded-full",
                !day.inMonth && "text-muted-foreground/45",
                day.isToday && "bg-primary text-primary-foreground shadow-sm",
                !day.isToday && day.hasReminder && "bg-primary/10 text-primary",
              )}
            >
              {day.date.getDate()}
              {day.hasReminder && !day.isToday ? (
                <span className="absolute bottom-1 size-1 rounded-full bg-primary" />
              ) : null}
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/activities" className="text-primary" style={{ fontSize: 13, fontWeight: 650, textDecoration: "none" }}>
            Xem lịch đầy đủ
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function PriorityPanel({ reminders }: { reminders: CareReminderType[] }) {
  const contacts = groupByContact(reminders);

  return (
    <Card className="border-border/70 shadow-sm shadow-black/[0.02]">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-sm">Ưu tiên khách hàng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 px-5 pb-5 pt-0">
        {contacts.length === 0 ? (
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>
            Chưa có khách cần ưu tiên.
          </p>
        ) : (
          contacts.map((contact, index) => (
            <Link
              key={contact.contactId}
              href={`/contacts/${contact.contactId}`}
              className="flex items-center justify-between gap-3"
              style={{ textDecoration: "none" }}
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full",
                    index === 0 && "bg-amber-50 text-amber-700",
                    index === 1 && "bg-blue-50 text-blue-700",
                    index === 2 && "bg-purple-50 text-purple-700",
                  )}
                  style={{ fontSize: 12, fontWeight: 800 }}
                >
                  {index + 1}
                </span>
                <span className="truncate text-blue-700" style={{ fontSize: 13, fontWeight: 600 }}>
                  {contact.name}
                </span>
              </div>
              <Badge variant="outline" className={contact.nearest < 0 ? "border-red-200 bg-red-50 text-red-700" : "border-blue-200 bg-blue-50 text-blue-700"}>
                {contact.nearest < 0
                  ? `Quá hạn: ${contact.count} việc`
                  : contact.nearest <= 1
                    ? `Hôm nay: ${contact.count} việc`
                    : `${contact.nearest} ngày tới: ${contact.count} việc`}
              </Badge>
            </Link>
          ))
        )}
        <div className="pt-2 text-center">
          <Link href="/contacts" className="text-primary" style={{ fontSize: 13, fontWeight: 650, textDecoration: "none" }}>
            Xem tất cả
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingPanel({ reminders }: { reminders: CareReminderType[] }) {
  const upcoming = reminders.filter((item) => item.daysUntil > 1).slice(0, 3);

  return (
    <Card className="border-border/70 shadow-sm shadow-black/[0.02]">
      <CardHeader className="px-5 py-4">
        <CardTitle className="text-sm">Lịch sắp tới</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-5 pb-5 pt-0">
        {upcoming.length === 0 ? (
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>
            Chưa có lịch sắp tới.
          </p>
        ) : (
          upcoming.map((reminder) => {
            const dueDate = new Date(reminder.dueDate);
            return (
              <Link
                key={reminder.id}
                href={`/contacts/${reminder.contactId}`}
                className="flex items-center gap-3"
                style={{ textDecoration: "none" }}
              >
                <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <span style={{ fontSize: 15, fontWeight: 800 }}>
                    {String(dueDate.getDate()).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: 11 }}>Th{dueDate.getMonth() + 1}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-foreground" style={{ fontSize: 13, fontWeight: 650 }}>
                    {reminder.title}
                  </p>
                  <p className="truncate text-muted-foreground" style={{ fontSize: 12 }}>
                    {reminder.contactName}
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                  {reminder.daysUntil} ngày
                </Badge>
              </Link>
            );
          })
        )}
        <div className="pt-1 text-center">
          <Link href="/activities" className="text-primary" style={{ fontSize: 13, fontWeight: 650, textDecoration: "none" }}>
            Xem thêm lịch sắp tới
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TodayPage() {
  const reminders = await getTodayCareReminders();
  const currentDate = new Date();
  const overdue = reminders.filter((item) => item.daysUntil < 0);
  const today = reminders.filter((item) => item.daysUntil >= 0 && item.daysUntil <= 1);
  const week = reminders.filter((item) => item.daysUntil > 1 && item.daysUntil <= 7);
  const month = reminders.filter((item) => item.daysUntil > 7 && item.daysUntil <= 30);
  const completedToday = 0;
  const scheduleRows = [...overdue, ...today, ...week, ...month];

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F8F8F7]">
      <header className="flex shrink-0 flex-col items-start justify-between gap-4 px-4 pb-3 pt-4 sm:flex-row sm:px-7 sm:pt-6">
        <div>
          <h1 className="text-foreground tracking-tight" style={{ fontSize: 22, fontWeight: 800 }}>
            Lịch trình hôm nay
          </h1>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground" style={{ fontSize: 13 }}>
            <Calendar className="size-4" />
            {formatHeaderDate(currentDate)}
          </p>
        </div>
        <div className="flex w-full items-center gap-2 overflow-x-auto pb-0.5 sm:w-auto sm:flex-col sm:items-end sm:overflow-visible">
          <Button asChild className="h-9 gap-2 px-4">
            <Link href="/activities">
              <Plus className="size-4" />
              Thêm lịch trình
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="size-4 text-primary" />
            Bộ lọc
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-5 sm:px-7 sm:pb-7">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5 xl:gap-4">
          <StatCard
            icon={Clock3}
            label="Quá hạn"
            value={overdue.length}
            note="Cần xử lý ngay"
            className="bg-red-50 text-red-700"
          />
          <StatCard
            icon={CalendarCheck}
            label="Hôm nay"
            value={today.length}
            note="Lịch trình hôm nay"
            className="bg-purple-50 text-primary"
          />
          <StatCard
            icon={Clock3}
            label="7 ngày tới"
            value={week.length}
            note="Lịch sắp tới"
            className="bg-blue-50 text-blue-700"
          />
          <StatCard
            icon={Calendar}
            label="30 ngày tới"
            value={month.length}
            note="Lịch trình sắp tới"
            className="bg-amber-50 text-orange-700"
          />
          <StatCard
            icon={CheckCircle2}
            label="Hoàn thành hôm nay"
            value={completedToday}
            note="Đã hoàn thành"
            className="bg-emerald-50 text-emerald-700"
          />
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_345px]">
          <ScheduleTable reminders={scheduleRows} />
          <aside className="space-y-4">
            <CalendarPanel reminders={reminders} currentDate={currentDate} />
            <PriorityPanel reminders={reminders} />
            <UpcomingPanel reminders={reminders} />
          </aside>
        </div>
      </main>
    </div>
  );
}
