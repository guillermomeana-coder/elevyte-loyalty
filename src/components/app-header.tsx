"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

interface AppHeaderProps {
  businessName: string;
  locationName: string;
}

export function AppHeader({ businessName, locationName }: AppHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b bg-white px-4 sticky top-0 z-30">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-5" />
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-3 py-1.5">
          <div className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-gray-700">{businessName}</span>
        </div>
        <span className="text-xs text-gray-400 hidden sm:inline">
          <svg className="inline h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
          {locationName}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          G
        </div>
      </div>
    </header>
  );
}
