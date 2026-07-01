"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarClock, ExternalLink, Loader2, MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import type { PipelineRes } from "@/lib/validations/deals.schema";
import { useGetPipeline, useDeleteDeal } from "@/hooks/useDeals";
import { useDealPipelineStore } from "@/stores/dealCards-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { STAGE_CONFIG, STAGES, type Deal } from "./types";
import { EditDealSheet } from "./EditDealSheet";

type DealListViewProps = {
  initialPipeline?: PipelineRes;
  selectedPeriod: string;
};

function formatValue(value: number) {
  if (!value) return "0";
  const millions = value / 1_000_000;
  if (millions >= 1000) return `${(millions / 1000).toFixed(1).replace(".0", "")} tá»·`;
  return `${millions % 1 === 0 ? millions : millions.toFixed(1)}tr`;
}

function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function isInSelectedPeriod(deal: Deal, selectedPeriod: string) {
  if (selectedPeriod === "all") return true;
  const [yearText, quarterText] = selectedPeriod.split("-Q");
  const year = Number(yearText);
  const quarter = Number(quarterText);
  const closeDate = new Date(deal.closeDate);
  if (!year || !quarter || Number.isNaN(closeDate.getTime())) return true;
  const dealQuarter = Math.floor(closeDate.getMonth() / 3) + 1;
  return closeDate.getFullYear() === year && dealQuarter === quarter;
}

export function DealListView({ initialPipeline, selectedPeriod }: DealListViewProps) {
  const { pipeline, setPipeline } = useDealPipelineStore();
  const { isLoading, isError, error } = useGetPipeline();
  const deleteDealMutation = useDeleteDeal();
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  useEffect(() => {
    if (initialPipeline) {
      setPipeline(initialPipeline);
    }
  }, [initialPipeline, setPipeline]);

  const deals = STAGES.flatMap((stage) => pipeline[stage])
    .filter((deal) => isInSelectedPeriod(deal, selectedPeriod))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const totalValue = deals.reduce((sum, deal) => sum + Number(deal.value ?? 0), 0);
  const forecastValue = deals.reduce(
    (sum, deal) => sum + Number(deal.value ?? 0) * (Number(deal.probability ?? 0) / 100),
    0,
  );

  const handleDelete = () => {
    if (!deletingDeal) return;
    deleteDealMutation.mutate({ id: deletingDeal.id, stage: deletingDeal.stage });
    setDeletingDeal(null);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 size={24} className="animate-spin" />
          <p style={{ fontSize: 13 }}>Đang tải danh sách deal...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="max-w-xs text-center">
          <p className="text-destructive" style={{ fontSize: 14, fontWeight: 600 }}>
            Không thể tải danh sách deal
          </p>
          <p className="mt-1 text-muted-foreground" style={{ fontSize: 12 }}>
            {error?.message ?? "Lỗi không xác định"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-full min-w-[980px] flex-col rounded-xl border border-border/70 bg-background shadow-sm shadow-black/[0.02]">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-foreground" style={{ fontSize: 15, fontWeight: 650 }}>
              Danh sách deal
            </h2>
            <p className="mt-1 text-muted-foreground" style={{ fontSize: 12 }}>
              {deals.length} deal · Tổng {formatValue(totalValue)} · Dự báo {formatValue(forecastValue)}
            </p>
          </div>
        </div>

        {deals.length === 0 ? (
          <div className="flex flex-1 items-center justify-center text-center">
            <div>
              <p className="text-foreground" style={{ fontSize: 15, fontWeight: 650 }}>
                Không có deal trong chế độ danh sách
              </p>
              <p className="mt-1 text-muted-foreground" style={{ fontSize: 13 }}>
                Đổi kỳ lọc hoặc tạo deal mới để bắt đầu theo dõi.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full">
              <thead className="sticky top-0 z-10 bg-background">
                <tr className="border-b text-left text-muted-foreground" style={{ fontSize: 12 }}>
                  <th className="px-5 py-3 font-semibold">Deal</th>
                  <th className="px-4 py-3 font-semibold">Khách hàng</th>
                  <th className="px-4 py-3 font-semibold">Giai đoạn</th>
                  <th className="px-4 py-3 font-semibold">Giá trị</th>
                  <th className="px-4 py-3 font-semibold">Dự báo</th>
                  <th className="px-4 py-3 font-semibold">Ngày đóng</th>
                  <th className="px-4 py-3 font-semibold">Ưu tiên</th>
                  <th className="px-5 py-3 text-right font-semibold">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => {
                  const stage = STAGE_CONFIG[deal.stage];
                  const dealForecast = Number(deal.value ?? 0) * (Number(deal.probability ?? 0) / 100);

                  return (
                    <tr key={deal.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="max-w-[270px] px-5 py-4">
                        <Link
                          href={`/pipeline/${deal.id}`}
                          className="block truncate text-foreground hover:text-primary"
                          style={{ fontSize: 13, fontWeight: 650, textDecoration: "none" }}
                        >
                          {deal.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-2 text-muted-foreground" style={{ fontSize: 11 }}>
                          {deal.propertyProject ? (
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="size-3" />
                              {deal.propertyProject}
                            </span>
                          ) : null}
                          {deal.appointmentDate ? (
                            <span className="inline-flex items-center gap-1">
                              <CalendarClock className="size-3" />
                              {formatDate(deal.appointmentDate)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-8">
                            <AvatarFallback className="bg-primary/10 text-primary" style={{ fontSize: 10, fontWeight: 700 }}>
                              {getInitials(deal.contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-foreground" style={{ fontSize: 13, fontWeight: 600 }}>
                              {deal.contact.name}
                            </p>
                            <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                              {deal.contact.phone ?? "Chưa có SĐT"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant="outline"
                          className="border-0"
                          style={{ background: stage.badgeBg, color: stage.badgeColor }}
                        >
                          <span className="size-1.5 rounded-full" style={{ background: stage.dot }} />
                          {stage.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-foreground" style={{ fontSize: 13, fontWeight: 650 }}>
                        {formatValue(Number(deal.value ?? 0))}
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-foreground" style={{ fontSize: 13, fontWeight: 650 }}>
                          {formatValue(dealForecast)}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: 11 }}>
                          {deal.probability}%
                        </p>
                      </td>
                      <td className="px-4 py-4 text-muted-foreground" style={{ fontSize: 13 }}>
                        {formatDate(deal.closeDate)}
                      </td>
                      <td className="px-4 py-4">
                        {deal.priority ? (
                          <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                            {deal.priority}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground" style={{ fontSize: 12 }}>-</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="outline" size="icon-sm">
                            <Link href={`/pipeline/${deal.id}`}>
                              <ExternalLink className="size-3.5" />
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="icon-sm">
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem style={{ fontSize: 13 }} onClick={() => setEditingDeal(deal)}>
                                <Pencil className="mr-2 size-3" />
                                Chá»‰nh sá»­a
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                style={{ fontSize: 13 }}
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeletingDeal(deal)}
                              >
                                <Trash2 className="mr-2 size-3" />
                                Xóa deal
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editingDeal ? (
        <EditDealSheet
          deal={editingDeal}
          open={!!editingDeal}
          onOpenChange={(open) => {
            if (!open) setEditingDeal(null);
          }}
        />
      ) : null}

      <AlertDialog
        open={!!deletingDeal}
        onOpenChange={(open) => {
          if (!open) setDeletingDeal(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ fontSize: 15 }}>Xóa deal này?</AlertDialogTitle>
            <AlertDialogDescription style={{ fontSize: 13 }}>
              Deal <strong>{deletingDeal?.title ?? "này"}</strong> sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ fontSize: 13 }}>Há»§y</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              style={{ fontSize: 13 }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Xóa deal
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

