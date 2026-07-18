import { requireAuth } from "@/lib/auth";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  const agencyName = user.agency?.name || "Elevyte";
  const logoUrl = user.agency?.logoUrl || null;

  // Use assigned business or first available
  const currentBusiness =
    user.business || user.allBusinesses[0] || { name: "Sin negocio", id: 0 };
  const locationName = "Principal";

  return (
    <SidebarProvider>
      <AppSidebar agencyName={agencyName} logoUrl={logoUrl} />
      <SidebarInset>
        <AppHeader
          businessName={currentBusiness.name}
          locationName={locationName}
        />
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
