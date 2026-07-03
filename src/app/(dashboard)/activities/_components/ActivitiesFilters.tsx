"use client";

import { type ReactNode } from "react";

import {
  ExternalLink,
  FileText,
  Mail,
  Phone,
  Users,
  ChevronDown,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { ActivityType } from "./types";

function FilterPill({
  icon,
  label,
  active,
  onClick,
}: {
  icon?: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 transition-colors cursor-pointer sm:min-h-8 sm:px-3 sm:py-1.5",
        active
          ? "bg-primary text-white border-primary"
          : "bg-background text-muted-foreground border-border hover:border-primary/40 hover:text-foreground",
      )}
      style={{ fontSize: 12, fontWeight: active ? 500 : 400 }}
    >
      {icon}
      {label}
    </button>
  );
}

function DropdownBtn({ label }: { label: string }) {
  return (
    <button
      className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 py-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground sm:min-h-8 sm:rounded-lg sm:px-3 sm:py-1.5"
      style={{ fontSize: 12 }}
    >
      {label}
      <ChevronDown size={11} />
    </button>
  );
}

export function ActivitiesFilters({
  activeFilter,
  onFilterChange,
  showEmpty,
  onToggleEmpty,
}: {
  activeFilter: "all" | ActivityType;
  onFilterChange: (filter: "all" | ActivityType) => void;
  showEmpty: boolean;
  onToggleEmpty: () => void;
}) {
  const filterPills: {
    key: "all" | ActivityType;
    label: string;
    icon?: ReactNode;
  }[] = [
    { key: "all", label: "Tất cả" },
    { key: "CALL", label: "Cuộc gọi", icon: <Phone size={11} /> },
    { key: "EMAIL", label: "Email", icon: <Mail size={11} /> },
    { key: "MEETING", label: "Gặp mặt", icon: <Users size={11} /> },
    { key: "NOTE", label: "Ghi chú", icon: <FileText size={11} /> },
  ];

  return (
    <div className="shrink-0 border-b bg-background px-4 py-3 space-y-2.5 sm:px-6">
      <div className="no-scrollbar -mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {filterPills.map((pill) => (
          <FilterPill
            key={pill.key}
            icon={pill.icon}
            label={pill.label}
            active={activeFilter === pill.key}
            onClick={() => onFilterChange(pill.key)}
          />
        ))}

        <button
          onClick={onToggleEmpty}
          className="ml-auto hidden shrink-0 items-center gap-1 rounded-full border border-dashed border-border bg-transparent px-2.5 py-1 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          style={{ fontSize: 11 }}
          title="Toggle empty state (dev)"
        >
          <ExternalLink size={10} />
          {showEmpty ? "Hiện dữ liệu" : "Empty state"}
        </button>
      </div>

      <div className="no-scrollbar -mx-4 flex snap-x items-center gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <DropdownBtn label="Tất cả nhân viên" />
        <DropdownBtn label="Tất cả liên hệ" />
        <DropdownBtn label="7 ngày qua" />
      </div>
    </div>
  );
}
