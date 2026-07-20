"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { date: "Lun", clientes: 0 },
  { date: "Mar", clientes: 1 },
  { date: "Mie", clientes: 2 },
  { date: "Jue", clientes: 1 },
  { date: "Vie", clientes: 3 },
  { date: "Sab", clientes: 2 },
  { date: "Dom", clientes: 1 },
];

export function ActivityChart() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Actividad semanal</CardTitle>
          <span className="text-xs text-muted-foreground bg-gray-100 px-2.5 py-1 rounded-md">Ultimos 7 dias</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "none",
                borderRadius: 8,
                fontSize: 12,
                color: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
              itemStyle={{ color: "#f97316" }}
              labelStyle={{ color: "#a1a1aa", marginBottom: 4 }}
            />
            <Area
              type="monotone"
              dataKey="clientes"
              stroke="#f97316"
              strokeWidth={2.5}
              fill="url(#colorClientes)"
              dot={{ r: 3, fill: "#f97316", strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#f97316", strokeWidth: 2, stroke: "#fff" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
