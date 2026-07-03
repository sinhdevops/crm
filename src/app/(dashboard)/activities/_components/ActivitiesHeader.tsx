"use client";

import { Calendar, ChevronDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ActivitiesHeader({
  dateRangeLabel,
  onNewActivity,
}: {
  dateRangeLabel: string;
  onNewActivity?: () => void;
}) {
  return (
    <header className="shrink-0 border-b bg-background flex flex-col items-start justify-between gap-3 px-4 py-3 sm:flex-row sm:items-center sm:px-6">
      <h2
        className="text-foreground"
        style={{ fontSize: 18, fontWeight: 700, margin: 0 }}
      >
        Lịch trình
      </h2>

      <div className="flex w-full items-center gap-2 overflow-x-auto pb-0.5 sm:w-auto sm:overflow-visible">
        <button
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:h-8 sm:rounded-lg sm:px-3"
          style={{ fontSize: 12 }}
        >
          <Calendar size={12} />
          {dateRangeLabel}
          <ChevronDown size={11} />
        </button>

        <Button
          size="md"
          className="shrink-0 sm:h-8 sm:rounded-lg sm:px-3"
          style={{ fontSize: 12 }}
          onClick={onNewActivity}
        >
          <Plus size={13} />
          Thêm hoạt động
        </Button>
      </div>
    </header>
  );
}
