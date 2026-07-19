"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Users,
  Building2,
  BarChart3,
  CreditCard,
  UtensilsCrossed,
  QrCode,
  Wallet,
  LogOut,
} from "lucide-react";

const agencyItems = [
  { title: "Clientes", url: "/whitelabel-clients", icon: Users },
  { title: "Agencia", url: "/my-whitelabel", icon: Building2 },
];

const clientItems = [
  { title: "Métricas", url: "/analytics", icon: BarChart3 },
  { title: "Tarjetas", url: "/fidelidad", icon: CreditCard },
  { title: "Menús", url: "/menu-definitivo", icon: UtensilsCrossed },
  { title: "Escanear", url: "/scan", icon: QrCode },
  { title: "Planes", url: "/pricing", icon: Wallet },
];

export function AppSidebar({ agencyName, logoUrl }: { agencyName: string; logoUrl?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={agencyName} className="h-10 w-10 rounded-md object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-md bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
              {agencyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <span className="font-semibold text-sm truncate">{agencyName}</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {agencyItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<a href={item.url} />}
                  isActive={pathname.startsWith(item.url)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>PANEL DEL CLIENTE</SidebarGroupLabel>
          <SidebarMenu>
            {clientItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  render={<a href={item.url} />}
                  isActive={pathname.startsWith(item.url)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
