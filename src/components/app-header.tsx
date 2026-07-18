"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  businessName: string;
  locationName: string;
}

export function AppHeader({ businessName, locationName }: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-medium">
          {businessName}
        </Badge>
        <span className="text-sm text-muted-foreground">📍 {locationName}</span>
      </div>
      <div className="ml-auto">
        <Badge variant="secondary">ES</Badge>
      </div>
    </header>
  );
}
