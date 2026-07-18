"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Demo data - will be replaced with real data from API
const data = [
  { date: "Lun", clientes: 0 },
  { date: "Mar", clientes: 0 },
  { date: "Mié", clientes: 1 },
  { date: "Jue", clientes: 0 },
  { date: "Vie", clientes: 2 },
  { date: "Sáb", clientes: 1 },
  { date: "Dom", clientes: 0 },
];

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Actividad semanal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="clientes"
              stroke="#f97316"
              fill="#fed7aa"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
