import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { requireCurrentUser } from "@/lib/supabase/server";
import { RealtimeNotifications } from "@/notifications/RealtimeNotifications";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireCurrentUser();

  return (
    <div className="h-[100dvh] overflow-hidden">
      <SidebarProvider
        className="h-full min-h-0 overflow-hidden"
        style={{ "--sidebar-width": "180px" } as React.CSSProperties}
      >
        <AppSidebar />
        <main className="flex h-full flex-1 min-w-0 flex-col overflow-hidden pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
          <RealtimeNotifications />
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
