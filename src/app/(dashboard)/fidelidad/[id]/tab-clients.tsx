"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Enrollment {
  id: number;
  customerFirstName: string | null;
  customerLastName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  currentStamps: number | null;
  totalSpend: string | null;
  totalVisits: number | null;
  lastVisitAt: Date | null;
  enrolledAt: Date | null;
}

export function TabClients({
  enrollments,
  cardType,
}: {
  enrollments: Enrollment[];
  cardType: string;
}) {
  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Clientes ({enrollments.length})</h3>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>
                  {cardType === "stamps" ? "Sellos" : "Gasto Total"}
                </TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Última Visita</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">
                    {e.customerFirstName} {e.customerLastName}
                  </TableCell>
                  <TableCell>{e.customerEmail || "—"}</TableCell>
                  <TableCell>{e.customerPhone || "—"}</TableCell>
                  <TableCell>
                    {cardType === "stamps"
                      ? e.currentStamps || 0
                      : `$${Number(e.totalSpend || 0).toLocaleString()}`}
                  </TableCell>
                  <TableCell>{e.totalVisits || 0}</TableCell>
                  <TableCell>
                    {e.lastVisitAt
                      ? new Date(e.lastVisitAt).toLocaleDateString("es-AR")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
              {enrollments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay clientes registrados en esta tarjeta
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
