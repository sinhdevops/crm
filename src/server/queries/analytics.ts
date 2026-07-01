import type { DashboardPeriod, DashboardRes } from "@/lib/validations/dashboard.schema";
import type {
  ActivitiesReportRes,
  DateParams,
  OverviewRes,
  PipelineAnalysisRes,
  TeamRepPerformance,
} from "@/services/reports.service";
import { createSupabaseServerClient, requireCurrentUser } from "@/lib/supabase/server";
import { getCurrentOwner } from "./profiles";

const stageLabels: Record<string, string> = {
  PROSPECT: "Tiềm năng",
  QUALIFIED: "Tư vấn",
  PROPOSAL: "Dẫn xem",
  CONSULTING: "Tư vấn",
  VIEWING: "Dẫn xem",
  NEGOTIATION: "Đàm phán",
  DEPOSIT: "Đặt cọc",
  CLOSED_WON: "Hoàn tất",
  CLOSED_LOST: "Đã thua",
};

const stageColors: Record<string, string> = {
  PROSPECT: "#3b82f6",
  QUALIFIED: "#a855f7",
  PROPOSAL: "#f97316",
  CONSULTING: "#a855f7",
  VIEWING: "#f97316",
  NEGOTIATION: "#eab308",
  DEPOSIT: "#22c55e",
  CLOSED_WON: "#22c55e",
  CLOSED_LOST: "#ef4444",
};

const pipelineStages = [
  "PROSPECT",
  "CONSULTING",
  "VIEWING",
  "NEGOTIATION",
  "DEPOSIT",
  "CLOSED_WON",
  "CLOSED_LOST",
];

function normalizeDealStage(stage: string) {
  if (stage === "QUALIFIED") return "CONSULTING";
  if (stage === "PROPOSAL") return "VIEWING";
  return stage;
}

function daysAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function parseLocalDate(value: string | null | undefined) {
  if (!value) return null;
  const datePart = value.split("T")[0];
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function toDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysUntil(date: Date) {
  const diff = date.getTime() - startOfToday().getTime();
  return Math.ceil(diff / 86_400_000);
}

function getSeverity(days: number) {
  if (days < 0) return "overdue" as const;
  if (days <= 1) return "critical" as const;
  if (days <= 7) return "urgent" as const;
  if (days <= 30) return "soon" as const;
  return "normal" as const;
}

function nextBirthdayDate(value: string | null | undefined) {
  const birthday = parseLocalDate(value);
  if (!birthday) return null;
  const today = startOfToday();
  let next = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
  if (next < today) {
    next = new Date(today.getFullYear() + 1, birthday.getMonth(), birthday.getDate());
  }
  return next;
}

type ContactReminderRow = {
  id: string;
  name: string;
  phone: string | null;
  birthday: string | null;
  payment_date: string | null;
  next_payment_date: string | null;
  next_follow_up_date: string | null;
};

function buildCareReminders(
  contacts: ContactReminderRow[],
  limit = 8,
): DashboardRes["careReminders"] {
  const reminders: DashboardRes["careReminders"] = [];

  for (const contact of contacts) {
    const birthday = nextBirthdayDate(contact.birthday);
    if (birthday) {
      const days = daysUntil(birthday);
      if (days <= 30) {
        reminders.push({
          id: `${contact.id}-birthday`,
          contactId: contact.id,
          contactName: contact.name,
          contactPhone: contact.phone,
          type: "BIRTHDAY",
          title: "Sinh nhật khách",
          description: days === 0 ? "Sinh nhật hôm nay" : `Còn ${days} ngày tới sinh nhật`,
          dueDate: toDateValue(birthday),
          daysUntil: days,
          severity: getSeverity(days),
        });
      }
    }

    const paymentDate = parseLocalDate(contact.next_payment_date ?? contact.payment_date);
    if (paymentDate) {
      const days = daysUntil(paymentDate);
      if (days <= 7) {
        reminders.push({
          id: `${contact.id}-payment`,
          contactId: contact.id,
          contactName: contact.name,
          contactPhone: contact.phone,
          type: "PAYMENT",
          title: "Nhắc đóng tiền",
          description:
            days < 0
              ? `Quá hạn ${Math.abs(days)} ngày`
              : days === 0
                ? "Đến hạn hôm nay"
                : `Còn ${days} ngày tới hạn đóng tiền`,
          dueDate: toDateValue(paymentDate),
          daysUntil: days,
          severity: getSeverity(days),
        });
      }
    }

    const followUpDate = parseLocalDate(contact.next_follow_up_date);
    if (followUpDate) {
      const days = daysUntil(followUpDate);
      if (days <= 7) {
        reminders.push({
          id: `${contact.id}-follow-up`,
          contactId: contact.id,
          contactName: contact.name,
          contactPhone: contact.phone,
          type: "FOLLOW_UP",
          title: "Chăm sóc khách",
          description:
            days < 0
              ? `Đã trễ ${Math.abs(days)} ngày chưa chăm`
              : days === 0
                ? "Cần chăm hôm nay"
                : `Còn ${days} ngày tới lịch chăm`,
          dueDate: toDateValue(followUpDate),
          daysUntil: days,
          severity: getSeverity(days),
        });
      }
    }
  }

  const sorted = reminders.sort((a, b) => a.daysUntil - b.daysUntil);
  return limit > 0 ? sorted.slice(0, limit) : sorted;
}

async function getRawData() {
  const user = await requireCurrentUser();
  const supabase = await createSupabaseServerClient();
  const owner = await getCurrentOwner();

  const [
    { data: deals, error: dealsError },
    { data: activities, error: activitiesError },
    { data: contacts, error: contactsError },
  ] =
    await Promise.all([
      supabase
        .from("deals")
        .select("*, contacts(id,name,company)")
        .eq("user_id", user.id)
        .is("deleted_at", null),
      supabase
        .from("activities")
        .select("*, contacts(id,name,company), deals(id,title)")
        .eq("user_id", user.id)
        .order("date", { ascending: false }),
      supabase
        .from("contacts")
        .select("id,name,phone,birthday,payment_date,next_payment_date,next_follow_up_date")
        .eq("user_id", user.id)
        .is("deleted_at", null),
    ]);

  if (dealsError) throw new Error(dealsError.message);
  if (activitiesError) throw new Error(activitiesError.message);
  if (contactsError) throw new Error(contactsError.message);

  return {
    user,
    owner,
    deals: (deals ?? []) as any[],
    activities: (activities ?? []) as any[],
    contacts: (contacts ?? []) as ContactReminderRow[],
  };
}

export async function getDashboardData(_period: DashboardPeriod): Promise<DashboardRes> {
  const { owner, deals, activities, contacts } = await getRawData();
  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);
  const openDeals = deals.filter((deal) => !["CLOSED_WON", "CLOSED_LOST"].includes(normalizeDealStage(deal.stage)));
  const wonDeals = deals.filter((deal) => normalizeDealStage(deal.stage) === "CLOSED_WON");
  const closedDeals = deals.filter((deal) => ["CLOSED_WON", "CLOSED_LOST"].includes(normalizeDealStage(deal.stage)));
  const revenue = wonDeals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);
  const winRate = closedDeals.length ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;

  const stages = pipelineStages.map((stage) => {
    const stageDeals = deals.filter((deal) => normalizeDealStage(deal.stage) === stage);
    return {
      name: stageLabels[stage],
      count: stageDeals.length,
      value: stageDeals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0),
    };
  });

  return {
    metrics: {
      totalDealValue: {
        label: "Tổng giá trị deal",
        value: totalValue,
        trend: { value: 0, positive: true },
        subtext: "Tất cả deal đang hoạt động",
      },
      openDeals: {
        label: "Deal đang mở",
        value: openDeals.length,
        trend: { value: openDeals.length, positive: true },
        subtext: "Trong quy trình",
      },
      winRate: {
        label: "Tỷ lệ thắng",
        value: winRate,
        trend: { value: 0, positive: true },
        subtext: `${closedDeals.length} closed deals`,
      },
      monthlyRevenue: {
        label: "Doanh thu thắng",
        value: revenue,
        progress: { current: revenue, target: Math.max(revenue, 1) },
      },
    },
    pipelineFunnel: {
      stages,
      totalCount: deals.length,
      totalValue,
    },
    leaderboard: [
      {
        rank: 1,
        userId: owner.id,
        name: owner.name,
        deals: wonDeals.length,
        revenue,
      },
    ],
    recentDeals: deals
      .slice()
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5)
      .map((deal) => ({
        id: deal.id,
        title: deal.title,
        company: deal.contacts?.company ?? deal.contacts?.name ?? "",
        stage: normalizeDealStage(deal.stage),
        value: Number(deal.value ?? 0),
        owner: { id: owner.id, name: owner.name },
        daysAgo: daysAgo(deal.updated_at),
      })),
    upcomingActivities: activities.slice(0, 5).map((activity) => ({
      id: activity.id,
      type: activity.type,
      title: activity.title ?? activity.note,
      contact: activity.contacts?.name ?? "",
      company: activity.contacts?.company ?? "",
      time: activity.date,
    })),
    careReminders: buildCareReminders(contacts),
  };
}

export async function getTodayCareReminders() {
  const { contacts } = await getRawData();
  return buildCareReminders(contacts, 0);
}

export async function getReportsOverview(_params?: DateParams): Promise<OverviewRes> {
  const { owner, deals } = await getRawData();
  const wonDeals = deals.filter((deal) => normalizeDealStage(deal.stage) === "CLOSED_WON");
  const lostDeals = deals.filter((deal) => normalizeDealStage(deal.stage) === "CLOSED_LOST");
  const closedDeals = [...wonDeals, ...lostDeals];
  const totalRevenue = wonDeals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);
  const avgDealSize = wonDeals.length ? totalRevenue / wonDeals.length : 0;
  const winRate = closedDeals.length ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  return {
    kpis: {
      totalRevenue: { value: totalRevenue, delta: "0%", up: true },
      closedDeals: { value: closedDeals.length, delta: "0", up: true },
      winRate: { value: winRate, delta: "0%", up: true },
      avgDealSize: { value: avgDealSize, delta: "0%", up: true },
      avgDaysToClose: { value: 0, delta: "0", up: true },
    },
    revenueByMonth: months.map((month, index) => ({
      month,
      actual: index === new Date().getMonth() ? totalRevenue : 0,
      target: Math.max(totalRevenue, 1),
    })),
    forecastData: months.map((month, index) => ({
      month,
      cumActual: index <= new Date().getMonth() ? totalRevenue : 0,
      cumForecast: totalRevenue,
    })),
    winLossData: [
      { stage: "Đã đóng", win: wonDeals.length, loss: lostDeals.length },
    ],
    topDeals: wonDeals.slice(0, 10).map((deal) => ({
      id: deal.id,
      name: deal.title,
      company: deal.contacts?.company ?? deal.contacts?.name ?? "",
      owner: { id: owner.id, name: owner.name },
      value: Number(deal.value ?? 0),
      closedAt: deal.updated_at,
      stage: normalizeDealStage(deal.stage),
    })),
  };
}

export async function getTeamPerformance(_params?: DateParams): Promise<TeamRepPerformance[]> {
  const { owner, deals, activities } = await getRawData();
  const wonDeals = deals.filter((deal) => normalizeDealStage(deal.stage) === "CLOSED_WON");
  const closedDeals = deals.filter((deal) => ["CLOSED_WON", "CLOSED_LOST"].includes(normalizeDealStage(deal.stage)));
  const actual = wonDeals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);

  return [
    {
      userId: owner.id,
      name: owner.name,
      actual,
      target: Math.max(actual, 1),
      winRate: closedDeals.length ? Math.round((wonDeals.length / closedDeals.length) * 100) : 0,
      activities: activities.length,
      avgDaysToClose: 0,
    },
  ];
}

export async function getPipelineAnalysis(): Promise<PipelineAnalysisRes> {
  const { deals } = await getRawData();
  const total = Math.max(deals.length, 1);

  return {
    conversionFunnel: pipelineStages.map((stage) => {
      const stageDeals = deals.filter((deal) => normalizeDealStage(deal.stage) === stage);
      return {
        stage: stageLabels[stage],
        count: stageDeals.length,
        value: stageDeals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0),
        percentage: Math.round((stageDeals.length / total) * 100),
        color: stageColors[stage],
      };
    }),
    bottlenecks: [],
    averageWinVelocity: "0 days",
    weightedForecast: [],
  };
}

export async function getActivitiesReport(_params?: DateParams): Promise<ActivitiesReportRes> {
  const { activities } = await getRawData();
  const counts = activities.reduce<Record<string, number>>((acc, activity) => {
    acc[activity.type] = (acc[activity.type] ?? 0) + 1;
    return acc;
  }, {});

  return {
    trend: [
      {
        name: "Tất cả",
        Calls: counts.CALL ?? 0,
        Emails: counts.EMAIL ?? 0,
        Meetings: counts.MEETING ?? 0,
        Tasks: counts.NOTE ?? 0,
      },
    ],
    statusDistribution: Object.entries(counts).map(([name, value]) => ({ name, value })),
  };
}




