import { cn } from "@/lib/utils";

// ── Canonical stage type ────────────────────────────────────────────────────
export type DealStage =
  | "prospect"
  | "consulting"
  | "viewing"
  | "negotiation"
  | "deposit"
  | "closed_won"
  | "closed_lost";

export const STAGE_COLORS: Record<
  DealStage,
  { label: string; badgeClass: string; dot: string; bg: string; text: string }
> = {
  prospect:    {
    label:      "Tiềm năng",
    badgeClass: "bg-blue-100 text-blue-700",
    dot:        "#3b82f6",
    bg:         "#dbeafe",
    text:       "#1d4ed8",
  },
  consulting:   {
    label:      "Tư vấn",
    badgeClass: "bg-purple-100 text-purple-700",
    dot:        "#a855f7",
    bg:         "#f3e8ff",
    text:       "#7e22ce",
  },
  viewing:    {
    label:      "Dẫn xem",
    badgeClass: "bg-orange-100 text-orange-700",
    dot:        "#f97316",
    bg:         "#ffedd5",
    text:       "#c2410c",
  },
  negotiation: {
    label:      "Đàm phán",
    badgeClass: "bg-yellow-100 text-yellow-700",
    dot:        "#eab308",
    bg:         "#fef9c3",
    text:       "#a16207",
  },
  deposit: {
    label:      "Đặt cọc",
    badgeClass: "bg-green-100 text-green-700",
    dot:        "#22c55e",
    bg:         "#dcfce7",
    text:       "#15803d",
  },
  closed_won:  {
    label:      "Hoàn tất",
    badgeClass: "bg-green-100 text-green-700",
    dot:        "#22c55e",
    bg:         "#dcfce7",
    text:       "#15803d",
  },
  closed_lost: {
    label:      "Đã thua",
    badgeClass: "bg-gray-100 text-gray-500",
    dot:        "#6b7280",
    bg:         "#f3f4f6",
    text:       "#6b7280",
  },
};

// ── Helper: normalise a loose stage string → DealStage key ─────────────────
// Accepts both "prospect" and "Tiềm năng" and "Đã thắng" etc.
export function normalizeStageName(raw: string): DealStage {
  const map: Record<string, DealStage> = {
    prospect:    "prospect",
    qualified:   "consulting",
    proposal:    "viewing",
    consulting:  "consulting",
    viewing:     "viewing",
    negotiation: "negotiation",
    deposit:     "deposit",
    closed_won:  "closed_won",
    closedwon:   "closed_won",
    "closed won":"closed_won",
    closed_lost: "closed_lost",
    closedlost:  "closed_lost",
    "closed lost":"closed_lost",
  };
  return map[raw.toLowerCase().replace(/ /g, "_")] ?? "prospect";
}

// ── The reusable badge ──────────────────────────────────────────────────────
interface StageBadgeProps {
  /** Accepts a DealStage key ("prospect") or a loose display string ("Đã thắng") */
  stage: DealStage | string;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const key = normalizeStageName(stage as string);
  const meta = STAGE_COLORS[key];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 whitespace-nowrap font-medium",
        meta.badgeClass,
        className
      )}
      style={{ fontSize: 12 }}
    >
      {meta.label}
    </span>
  );
}
