"use client";

import { useState } from "react";
import {
  Building2, Users, Mail, User, Lock, CreditCard, FileText, Bell, Puzzle, BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { WorkspaceInfo } from "./_components/WorkspaceInfo";
import { MembersRoles }  from "./_components/MembersRoles";
import { InvitationsList } from "./_components/InvitationsList";

// ── Nav structure ─────────────────────────────────────────────────────────────
type SettingsTab =
  | "workspace-info" | "members" | "invitations"
  | "profile" | "password"
  | "billing" | "invoices"
  | "notifications" | "integrations";

const NAV_GROUPS: {
  label: string;
  items: { id: SettingsTab; label: string; Icon: typeof Building2 }[];
}[] = [
  {
    label: "KHÔNG GIAN LÀM VIỆC",
    items: [
      { id: "workspace-info", label: "Thông tin workspace",  Icon: Building2 },
      { id: "members",        label: "Thành viên & vai trò", Icon: Users      },
      { id: "invitations",    label: "Lời mời",     Icon: Mail       },
    ],
  },
  {
    label: "TÀI KHOẢN",
    items: [
      { id: "profile",  label: "Hồ sơ của tôi", Icon: User },
      { id: "password", label: "Đổi mật khẩu",   Icon: Lock },
    ],
  },
  {
    label: "THANH TOÁN",
    items: [
      { id: "billing",  label: "Gói & thanh toán",  Icon: CreditCard },
      { id: "invoices", label: "Lịch sử hóa đơn",   Icon: FileText   },
    ],
  },
  {
    label: "HỆ THỐNG",
    items: [
      { id: "notifications", label: "Thông báo",   Icon: Bell   },
      { id: "integrations",  label: "Tích hợp", Icon: Puzzle },
    ],
  },
];

// ── Placeholder for unbuilt tabs ───────────────────────────────────────────────
function ComingSoonContent({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ minHeight: 420 }}>
      <div className="size-14 rounded-full flex items-center justify-center mb-4" style={{ background: "#EEEDFE" }}>
        <BarChart2 size={24} style={{ color: "#534AB7" }} />
      </div>
      <p className="text-[#1A1A18] mb-1.5" style={{ fontSize: 15, fontWeight: 600 }}>{label}</p>
      <p className="text-[#6B6B67]" style={{ fontSize: 13 }}>Tính năng này đang được phát triển</p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("workspace-info");

  const activeLabel = NAV_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeTab)?.label ?? "";

  return (
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header
        className="shrink-0 border-b border-[#E8E7E2] bg-white flex items-center px-4 py-3 gap-3 sm:px-6"
      >
        <h1 className="text-[#1A1A18] tracking-tight" style={{ fontSize: 15, fontWeight: 600, lineHeight: 1 }}>
          Cài đặt
        </h1>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#F8F8F7] lg:flex-row">

        {/* ── Settings sub-nav ────────────────────────────────────────────────── */}
        <aside
          className="shrink-0 overflow-x-auto border-b border-[#E8E7E2] bg-white lg:overflow-y-auto lg:border-b-0 lg:border-r"
        >
          <div className="flex gap-3 p-3 lg:block lg:p-4 lg:w-[220px]">
            <p className="hidden text-[#1A1A18] mb-4 lg:block" style={{ fontSize: 16, fontWeight: 500 }}>Cài đặt</p>

            <div className="flex gap-3 lg:flex-col lg:gap-5">
              {NAV_GROUPS.map((group) => (
                <div key={group.label} className="shrink-0">
                  {/* Group label */}
                  <p
                    className="hidden text-[#6B6B67] mb-1.5 tracking-wider lg:block"
                    style={{ fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}
                  >
                    {group.label}
                  </p>

                  {/* Items */}
                  <div className="flex gap-1 lg:flex-col lg:gap-0.5">
                    {group.items.map(({ id, label, Icon }) => {
                      const active = activeTab === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={cn(
                            "flex whitespace-nowrap items-center gap-2 w-full px-2.5 py-2 rounded-lg transition-colors text-left cursor-pointer",
                            active
                              ? "bg-[#EEEDFE] text-[#534AB7]"
                              : "text-[#6B6B67] hover:bg-[#F8F8F7] hover:text-[#1A1A18]"
                          )}
                          style={{ fontSize: 13, fontWeight: active ? 500 : 400, border: "none", background: active ? "#EEEDFE" : undefined }}
                        >
                          <Icon size={15} strokeWidth={active ? 2.2 : 1.8} />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Settings content ─────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === "workspace-info" && <WorkspaceInfo />}
          {activeTab === "members"        && <MembersRoles />}
          {activeTab === "invitations"    && <InvitationsList />}
          {activeTab !== "workspace-info" && activeTab !== "members" && activeTab !== "invitations" && (
            <ComingSoonContent label={activeLabel} />
          )}
        </main>

      </div>
    </div>
  );
}

