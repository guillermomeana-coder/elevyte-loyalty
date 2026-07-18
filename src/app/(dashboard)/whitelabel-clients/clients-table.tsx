"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBusiness } from "@/lib/actions/business";
import { toast } from "sonner";

interface Business {
  id: number;
  name: string;
  slug: string | null;
  locationCount: number;
  createdAt: Date | null;
}

export function ClientsTable({ businesses }: { businesses: Business[] }) {
  async function handleDelete(id: number, name: string) {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    try {
      await deleteBusiness(id);
      toast.success("Negocio eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>NOMBRE</TableHead>
          <TableHead>UBICACIONES</TableHead>
          <TableHead>FECHA REGISTRO</TableHead>
          <TableHead>ACCIONES</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {businesses.map((biz) => (
          <TableRow key={biz.id}>
            <TableCell className="font-medium">{biz.name}</TableCell>
            <TableCell>{biz.locationCount}</TableCell>
            <TableCell>
              {biz.createdAt
                ? new Date(biz.createdAt).toLocaleDateString("es-AR")
                : "—"}
            </TableCell>
            <TableCell className="space-x-2">
              <Link href={`/manage-whitelabel-client/${biz.id}`}>
                <Button variant="outline" size="sm">
                  Gestionar
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-700"
                onClick={() => handleDelete(biz.id, biz.name)}
              >
                Eliminar
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {businesses.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No hay negocios. Crea uno para empezar.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
