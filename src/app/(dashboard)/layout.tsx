import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { requireCurrentUser } from "@/lib/supabase/server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  await requireCurrentUser();

  return (
    <div className="min-h-svh">
      <SidebarProvider style={{ "--sidebar-width": "180px" } as React.CSSProperties}>
        <AppSidebar />
        <main className="flex h-[100dvh] flex-1 min-w-0 flex-col pb-16 md:h-svh md:pb-0">
          {children}
        </main>
      </SidebarProvider>
    </div>
  );
}
