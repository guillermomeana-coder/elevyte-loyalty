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
  ChevronRight,
} from "lucide-react";

const agencyItems = [
  { title: "Clientes", url: "/whitelabel-clients", icon: Users },
  { title: "Agencia", url: "/my-whitelabel", icon: Building2 },
];

const clientItems = [
  { title: "Metricas", url: "/analytics", icon: BarChart3 },
  { title: "Tarjetas", url: "/fidelidad", icon: CreditCard },
  { title: "Menus", url: "/menu-definitivo", icon: UtensilsCrossed },
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
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-4 pb-2">
        <div className="flex items-center gap-3 px-1">
          {logoUrl ? (
            <img src={logoUrl} alt={agencyName} className="h-9 w-9 rounded-xl object-cover shadow-sm" />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {agencyName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{agencyName}</p>
            <p className="text-[11px] text-muted-foreground">Panel de control</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
            Agencia
          </SidebarGroupLabel>
          <SidebarMenu>
            {agencyItems.map((item) => {
              const active = pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                    isActive={active}
                    className={active ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-50"}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {active && <ChevronRight className="h-3 w-3 ml-auto opacity-50" />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-3" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3 mb-1">
            Panel del cliente
          </SidebarGroupLabel>
          <SidebarMenu>
            {clientItems.map((item) => {
              const active = pathname.startsWith(item.url);
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                    isActive={active}
                    className={active ? "bg-orange-50 text-orange-600 font-medium" : "text-gray-600 hover:bg-gray-50"}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                    {active && <ChevronRight className="h-3 w-3 ml-auto opacity-50" />}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Cerrar sesion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
