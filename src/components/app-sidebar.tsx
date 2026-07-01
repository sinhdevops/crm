"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  LayoutDashboard,
  GitBranch,
  Users,
  CalendarCheck,
  BarChart2,
  Settings,
  LogOut,
  BellRing,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLogout, useMe } from "@/hooks/useAuth";

function getInitials(name?: string): string {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0][0];
    const last = parts[parts.length - 1][0];
    return (first + last).toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : '';
}

const navItems = [
  { icon: BellRing, label: "Hôm nay", path: "/today" },
  { icon: LayoutDashboard, label: "Bảng điều khiển", path: "/" },
  { icon: GitBranch, label: "Quy trình", path: "/pipeline" },
  { icon: Users, label: "Khách hàng", path: "/contacts" },
  { icon: CalendarCheck, label: "Lịch trình", path: "/activities" },
  { icon: BarChart2, label: "Báo cáo", path: "/reports" },
  { icon: Settings, label: "Cài đặt", path: "/settings" },
];

export function AppSidebar() {
  const { mutate: logout } = useLogout();
  const { data: me } = useMe();
  const pathName = usePathname();

  const handleLogout = () => {
    logout();
  };
  const isActive = (path: string) => {
    if (path === "/") return pathName === "/";
    return pathName.startsWith(path);
  };
  return (
    <>
    <Sidebar className="hidden bg-background border-r border-border md:flex md:h-[100dvh] shrink-0">
      <SidebarHeader>
        {/* Brand */}
        <div className="px-4 pt-5 pb-4 border-b border-border shrink-0">
          <Link
            href="/today"
            className="flex items-center gap-2 mb-1 no-underline"
            style={{ textDecoration: "none" }}
          >
            <div className="size-6 bg-primary rounded-[6px] flex items-center justify-center shrink-0">
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M2 10L6.5 3L11 10H2Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span
              className="text-foreground"
              style={{
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
              }}
            >
              LeadFlow
            </span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="flex-1 p-2 space-y-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <SidebarMenuItem key={item.path}>
                  <Link
                    href={item.path}
                    style={{ textDecoration: "none", fontSize: 13, fontWeight: active ? 500 : 400 }}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded-lg transition-colors",
                      active
                        ? "bg-secondary text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon size={14} strokeWidth={active ? 2.2 : 1.8} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {/* User section */}
        <div className="flex items-center gap-2 p-3 border-t border-border shrink-0">
          <Avatar className="size-[30px] shrink-0">
            <AvatarFallback
              className="border-0"
              style={{
                background: "#D4E8F5",
                color: "#1A5C7A",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {getInitials(me?.name) || "NM"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p
              className="text-foreground truncate"
              style={{ fontSize: 12, fontWeight: 500 }}
            >
              {me?.name || "Văn Sinh"}
            </p>
            <p className="text-muted-foreground" style={{ fontSize: 11 }}>
              {me?.role ? (me.role.charAt(0) + me.role.slice(1).toLowerCase().replace('_', ' ')) : "Quản lý"}
            </p>
          </div>

          <Button
            className="text-muted-foreground hover:text-foreground transition-colors p-0.5 flex items-center bg-transparent border-0 cursor-pointer"
            title="Đăng xuất"
            onClick={handleLogout}
          >
            <LogOut size={13} />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_rgba(0,0,0,0.04)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 py-1.5">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] no-underline transition-colors",
                active
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              style={{ textDecoration: "none" }}
            >
              <Icon size={16} strokeWidth={active ? 2.3 : 1.9} />
              <span className="w-full truncate text-center">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
