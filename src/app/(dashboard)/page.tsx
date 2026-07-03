"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Plus, Wallet, GitBranch, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { PipelineChart } from "@/components/dashboard/PipelineChart";
import { Leaderboard } from "@/components/dashboard/Leaderboard";
import { RecentDeals } from "@/components/dashboard/RecentDeals";
import { UpcomingActivities } from "@/components/dashboard/UpcomingActivities";
import { CareReminders } from "@/components/dashboard/CareReminders";
import { Skeleton } from "@/components/ui/skeleton";
import { useMe } from "@/hooks/useAuth";
import { dashboardService } from "@/services/dashboard.service";
import { DashboardPeriod } from "@/lib/validations/dashboard.schema";
import { formatVndShort } from "@/lib/helper";

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("quarter");
  const { data: me } = useMe();
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", period],
    queryFn: () => dashboardService.getDashboardData(period),
  });

  const formatDateVi = () => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const date = new Date();
    return `${days[date.getDay()]}, ${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <header className="shrink-0 border-b bg-background flex flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
        <h1
          className="text-foreground tracking-tight"
          style={{ fontSize: 15, fontWeight: 600, lineHeight: 1 }}
        >
          Dashboard
        </h1>

        <div className="flex w-full items-center gap-2 overflow-x-auto pb-0.5 sm:w-auto sm:overflow-visible">
          {/* Period tabs */}
          <Tabs value={period} onValueChange={(val) => setPeriod(val as DashboardPeriod)}>
            <TabsList className="h-8 gap-0 p-0.5">
              <TabsTrigger value="week"    className="h-7 px-3 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tuần này</TabsTrigger>
              <TabsTrigger value="month"   className="h-7 px-3 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tháng này</TabsTrigger>
              <TabsTrigger value="quarter" className="h-7 px-3 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Quý này</TabsTrigger>
            </TabsList>
          </Tabs>

          <Separator orientation="vertical" className="hidden h-5 mx-0.5 sm:block" />

          <Button
            variant="outline"
            size="sm"
            className="hidden h-8 gap-1.5 border-border text-muted-foreground hover:text-foreground text-xs sm:inline-flex"
          >
            <Download className="size-3.5" />
            Xuất báo cáo
          </Button>

          <Button size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
            <Plus className="size-3.5" />
            Thêm deal
          </Button>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8F8F7] sm:p-6 sm:space-y-5">

        {/* Welcome strip */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground" style={{ fontSize: 13 }}>
            Chào buổi sáng,{" "}
            <strong className="text-foreground" style={{ fontWeight: 600 }}>
              {me?.name || "Nguyễn Minh"}
            </strong>
          </p>
          <span
            className="text-muted-foreground bg-background border border-border rounded-md px-2.5 py-1"
            style={{ fontSize: 11 }}
          >
            {formatDateVi()}
          </span>
        </div>

        {/* ── Metric cards ─────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-background border border-border/70 rounded-xl p-5 space-y-3 shadow-none">
                <Skeleton className="h-3.5 w-24 rounded" />
                <div className="flex items-end gap-2">
                  <Skeleton className="h-8 w-20 rounded" />
                  <Skeleton className="h-4.5 w-10 rounded-full" />
                </div>
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            ))}
          </div>
        ) : (
          dashboardData && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 xl:gap-4">
              <MetricCard
                label={dashboardData.metrics.totalDealValue.label}
                value={formatVndShort(dashboardData.metrics.totalDealValue.value)}
                trend={
                  dashboardData.metrics.totalDealValue.trend
                    ? {
                        value: `${dashboardData.metrics.totalDealValue.trend.value >= 0 ? "+" : ""}${dashboardData.metrics.totalDealValue.trend.value}%`,
                        positive: dashboardData.metrics.totalDealValue.trend.positive,
                      }
                    : undefined
                }
                subtext={dashboardData.metrics.totalDealValue.subtext}
                icon={Wallet}
              />
              <MetricCard
                label={dashboardData.metrics.openDeals.label}
                value={String(dashboardData.metrics.openDeals.value)}
                trend={
                  dashboardData.metrics.openDeals.trend
                    ? {
                        value: `${dashboardData.metrics.openDeals.trend.value >= 0 ? "+" : ""}${dashboardData.metrics.openDeals.trend.value} ${period === "week" ? "tuần này" : period === "quarter" ? "quý này" : "tháng này"}`,
                        positive: dashboardData.metrics.openDeals.trend.positive,
                      }
                    : undefined
                }
                subtext={dashboardData.metrics.openDeals.subtext}
                icon={GitBranch}
              />
              <MetricCard
                label={dashboardData.metrics.winRate.label}
                value={`${dashboardData.metrics.winRate.value}%`}
                trend={
                  dashboardData.metrics.winRate.trend
                    ? {
                        value: `${dashboardData.metrics.winRate.trend.value >= 0 ? "+" : ""}${dashboardData.metrics.winRate.trend.value}%`,
                        positive: dashboardData.metrics.winRate.trend.positive,
                      }
                    : undefined
                }
                subtext={dashboardData.metrics.winRate.subtext}
                icon={Target}
                iconBg="#FEE2E2"
                iconColor="#A32D2D"
              />
              <MetricCard
                label={dashboardData.metrics.monthlyRevenue.label}
                value={formatVndShort(dashboardData.metrics.monthlyRevenue.value)}
                icon={TrendingUp}
                progress={dashboardData.metrics.monthlyRevenue.progress}
              />
            </div>
          )
        )}

        <CareReminders reminders={dashboardData?.careReminders} isLoading={isLoading} />

        {/* ── Charts row ───────────────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]" style={{ minHeight: 340 }}>
          <PipelineChart
            stages={dashboardData?.pipelineFunnel.stages}
            totalCount={dashboardData?.pipelineFunnel.totalCount}
            totalValue={dashboardData?.pipelineFunnel.totalValue}
            isLoading={isLoading}
          />
          <Leaderboard reps={dashboardData?.leaderboard} isLoading={isLoading} />
        </div>

        {/* ── Bottom row ───────────────────────────────────────────────────── */}
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <RecentDeals deals={dashboardData?.recentDeals} isLoading={isLoading} />
          <UpcomingActivities activities={dashboardData?.upcomingActivities} isLoading={isLoading} />
        </div>

      </main>
    </div>
  );
}

