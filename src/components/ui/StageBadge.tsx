import { cn } from "@/lib/utils";

// ── Canonical stage type ────────────────────────────────────────────────────
import { DealStage } from "@/lib/validations/deals.schema";

export const STAGE_COLORS: Record<
  DealStage,
  { label: string; badgeClass: string; dot: string; bg: string; text: string }
> = {
  PROSPECT:    {
    label:      "Tiềm năng",
    badgeClass: "bg-blue-100 text-blue-700",
    dot:        "#3b82f6",
    bg:         "#dbeafe",
    text:       "#1d4ed8",
  },
  CONSULTING:   {
    label:      "Tư vấn",
    badgeClass: "bg-purple-100 text-purple-700",
    dot:        "#a855f7",
    bg:         "#f3e8ff",
    text:       "#7e22ce",
  },
  VIEWING:    {
    label:      "Dẫn xem",
    badgeClass: "bg-orange-100 text-orange-700",
    dot:        "#f97316",
    bg:         "#ffedd5",
    text:       "#c2410c",
  },
  NEGOTIATION: {
    label:      "Đàm phán",
    badgeClass: "bg-yellow-100 text-yellow-700",
    dot:        "#eab308",
    bg:         "#fef9c3",
    text:       "#a16207",
  },
  DEPOSIT: {
    label:      "Đặt cọc",
    badgeClass: "bg-green-100 text-green-700",
    dot:        "#22c55e",
    bg:         "#dcfce7",
    text:       "#15803d",
  },
  CLOSED_WON:  {
    label:      "Hoàn tất",
    badgeClass: "bg-green-100 text-green-700",
    dot:        "#22c55e",
    bg:         "#dcfce7",
    text:       "#15803d",
  },
  CLOSED_LOST: {
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
    prospect:    "PROSPECT",
    qualified:   "CONSULTING",
    proposal:    "VIEWING",
    consulting:  "CONSULTING",
    viewing:     "VIEWING",
    negotiation: "NEGOTIATION",
    deposit:     "DEPOSIT",
    closed_won:  "CLOSED_WON",
    closedwon:   "CLOSED_WON",
    "closed won":"CLOSED_WON",
    closed_lost: "CLOSED_LOST",
    closedlost:  "CLOSED_LOST",
    "closed lost":"CLOSED_LOST",
  };
  return map[raw.toLowerCase().replace(/ /g, "_")] ?? "PROSPECT";
}

// ── The reusable badge ──────────────────────────────────────────────────────
interface StageBadgeProps {
  /** Accepts a DealStage key ("prospect") or a loose display string ("Đã thắng") */
  stage: DealStage;
  className?: string;
}

export function StageBadge({ stage, className }: StageBadgeProps) {
  const meta = STAGE_COLORS[stage];

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
