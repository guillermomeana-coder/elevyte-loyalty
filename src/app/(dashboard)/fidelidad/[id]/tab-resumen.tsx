"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  card: { id: number; geopushEnabled: boolean | null; geopushMessage: string | null };
  enrollmentCount: number;
  enrollments: {
    id: number;
    customerFirstName: string | null;
    customerLastName: string | null;
    customerPhone: string | null;
    totalVisits: number | null;
    lastVisitAt: Date | null;
    currentStamps: number | null;
    totalSpend: string | null;
  }[];
  links: {
    id: number;
    slug: string;
    name: string | null;
    clicks: number | null;
    registrations: number | null;
  }[];
}

export function TabResumen({ card, enrollmentCount, enrollments, links }: Props) {
  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total de Clientes</p>
            <p className="text-3xl font-bold">{enrollmentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total de Visitas</p>
            <p className="text-3xl font-bold">
              {enrollments.reduce((sum, e) => sum + (e.totalVisits || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total de Registros</p>
            <p className="text-3xl font-bold">{enrollmentCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Geopush</p>
            <Badge variant={card.geopushEnabled ? "default" : "secondary"} className={card.geopushEnabled ? "bg-green-500" : ""}>
              {card.geopushEnabled ? "Activo" : "Inactivo"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Registration Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparte tu tarjeta</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enlace</TableHead>
                <TableHead>Clics</TableHead>
                <TableHead>Registros</TableHead>
                <TableHead>Conversión</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => {
                const conv =
                  link.clicks && link.clicks > 0
                    ? ((link.registrations || 0) / link.clicks * 100).toFixed(1)
                    : "0.0";
                return (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono text-sm">
                      /register/{link.slug}
                    </TableCell>
                    <TableCell>{link.clicks || 0}</TableCell>
                    <TableCell>{link.registrations || 0}</TableCell>
                    <TableCell>{conv}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Clientes Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aún no hay clientes registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead>Total Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell>
                      {e.customerFirstName} {e.customerLastName}
                    </TableCell>
                    <TableCell>{e.customerPhone || "—"}</TableCell>
                    <TableCell>
                      {e.lastVisitAt
                        ? new Date(e.lastVisitAt).toLocaleDateString("es-AR")
                        : "—"}
                    </TableCell>
                    <TableCell>{e.totalVisits || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
