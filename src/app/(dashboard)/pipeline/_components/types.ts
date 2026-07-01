// Re-export từ deals.schema để dùng chung trong pipeline components
export { DealStage, DealStageValues } from "@/lib/validations/deals.schema";
import type { DealCard, DealDetail, DealStage } from "@/lib/validations/deals.schema";

// Alias để các component dùng Stage thay vì DealStage (backward compat)
export type Stage = DealStage;

export type Deal = DealCard;
export type { DealDetail };

export const STAGE_CONFIG: Record<
  DealStage,
  { label: string; badgeBg: string; badgeColor: string; dot: string; probability: number; description: string }
> = {
  PROSPECT: {
    label: "Tiềm năng",
    badgeBg: "#dbeafe",
    badgeColor: "#1d4ed8",
    dot: "#3b82f6",
    probability: 10,
    description: "Lead mới, chưa xác nhận đủ nhu cầu",
  },
  CONSULTING: {
    label: "Tư vấn",
    badgeBg: "#f3e8ff",
    badgeColor: "#7e22ce",
    dot: "#a855f7",
    probability: 25,
    description: "Đã liên hệ, đang làm rõ nhu cầu",
  },
  VIEWING: {
    label: "Dẫn xem",
    badgeBg: "#ffedd5",
    badgeColor: "#c2410c",
    dot: "#f97316",
    probability: 45,
    description: "Đã hẹn hoặc đã dẫn khách đi xem",
  },
  NEGOTIATION: {
    label: "Đàm phán",
    badgeBg: "#fef3c7",
    badgeColor: "#a16207",
    dot: "#eab308",
    probability: 65,
    description: "Khách ưng, đang thương lượng giá/điều khoản",
  },
  DEPOSIT: {
    label: "Đặt cọc",
    badgeBg: "#dcfce7",
    badgeColor: "#15803d",
    dot: "#22c55e",
    probability: 90,
    description: "Khách đã xuống cọc",
  },
  CLOSED_WON: {
    label: "Hoàn tất",
    badgeBg: "#dcfce7",
    badgeColor: "#15803d",
    dot: "#16a34a",
    probability: 100,
    description: "Đã ký hợp đồng/công chứng",
  },
  CLOSED_LOST: {
    label: "Đã thua",
    badgeBg: "#fee2e2",
    badgeColor: "#b91c1c",
    dot: "#ef4444",
    probability: 0,
    description: "Khách bỏ ngang hoặc chọn phương án khác",
  },
};

export const STAGES: DealStage[] = [
  "PROSPECT",
  "CONSULTING",
  "VIEWING",
  "NEGOTIATION",
  "DEPOSIT",
  "CLOSED_WON",
  "CLOSED_LOST",
];

export type Task = {
  id: string;
  title: string;
  done: boolean;
  dueDate: Date | null;
  createdAt: Date;
};
