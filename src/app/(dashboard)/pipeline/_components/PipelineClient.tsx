"use client";

import { Plus, Filter, LayoutGrid, List, ChevronDown } from "lucide-react";
import { useState } from "react";
import { KanbanBoard } from "./KanbanBoard";
import { DealListView } from "./DealListView";
import { CreateDealSheet } from "./CreateDealSheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { PipelineRes } from "@/lib/validations/deals.schema";
import { useDealsRealtime } from "@/realtime/useDealsRealtime";
import type { Stage } from "./types";

type PipelineClientProps = {
  initialPipeline: PipelineRes;
};

const periodOptions = [
  { value: "all", label: "Tất cả" },
  { value: "2026-Q1", label: "Q1 2026" },
  { value: "2026-Q2", label: "Q2 2026" },
  { value: "2026-Q3", label: "Q3 2026" },
  { value: "2026-Q4", label: "Q4 2026" },
] as const;

export function PipelineClient({ initialPipeline }: PipelineClientProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createStage, setCreateStage] = useState<Stage>("PROSPECT");
  const [selectedPeriod, setSelectedPeriod] = useState("all");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  useDealsRealtime();

  const openCreateDeal = (stage: Stage = "PROSPECT") => {
    setCreateStage(stage);
    setCreateOpen(true);
  };
  const selectedPeriodLabel =
    periodOptions.find((option) => option.value === selectedPeriod)?.label ?? "Tất cả";

  return (
    <div className="flex h-full flex-col flex-1 min-w-0 overflow-hidden">
      <header className="shrink-0 border-b bg-background flex flex-col items-start justify-between gap-3 px-4 py-3 lg:flex-row lg:items-center lg:px-6">
        <div className="flex w-full items-center justify-between gap-3 lg:w-auto lg:justify-start">
          <h1
            className="text-foreground tracking-tight"
            style={{ fontSize: 15, fontWeight: 600, lineHeight: 1 }}
          >
            Quy trình bán hàng
          </h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-1 h-6 px-2.5 rounded-full border border-border bg-background text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                style={{ fontSize: 12 }}
              >
                {selectedPeriodLabel}
                <ChevronDown size={11} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-32">
              {periodOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  className="cursor-pointer"
                  style={{ fontSize: 12 }}
                  onClick={() => setSelectedPeriod(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex w-full items-center gap-2 overflow-x-auto pb-0.5 lg:w-auto lg:overflow-visible">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              title="Bảng Kanban"
              aria-pressed={viewMode === "kanban"}
              onClick={() => setViewMode("kanban")}
              className={`px-2.5 py-1.5 flex items-center border-0 cursor-pointer transition-colors ${
                viewMode === "kanban"
                  ? "bg-secondary text-primary"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              type="button"
              title="Danh sách"
              aria-pressed={viewMode === "list"}
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1.5 flex items-center border-0 border-l border-border cursor-pointer transition-colors ${
                viewMode === "list"
                  ? "bg-secondary text-primary"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              <List size={13} />
            </button>
          </div>

          <Separator orientation="vertical" className="hidden h-5 sm:block" />

          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5 border-border text-muted-foreground hover:text-foreground text-xs"
          >
            <Filter size={13} />
            Lọc theo
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1 border-border text-muted-foreground hover:text-foreground text-xs"
          >
            Tất cả nhân viên
            <ChevronDown size={12} />
          </Button>

          <Button
            size="sm"
            className="h-8 shrink-0 gap-1.5 text-xs"
            onClick={() => openCreateDeal("PROSPECT")}
          >
            <Plus size={13} />
            Thêm deal
          </Button>
        </div>
      </header>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-3 bg-[#F8F8F7] sm:p-5">
        <div className={viewMode === "kanban" ? "min-w-230 h-full" : "h-full min-w-[980px]"}>
          {viewMode === "kanban" ? (
            <KanbanBoard
              initialPipeline={initialPipeline}
              onAddDeal={openCreateDeal}
              selectedPeriod={selectedPeriod}
            />
          ) : (
            <DealListView
              initialPipeline={initialPipeline}
              selectedPeriod={selectedPeriod}
            />
          )}
        </div>
      </main>

      <CreateDealSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultStage={createStage}
      />
    </div>
  );
}
