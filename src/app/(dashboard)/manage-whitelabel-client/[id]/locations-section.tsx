"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createLocation, deleteLocation } from "@/lib/actions/locations";
import { toast } from "sonner";

interface Location {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  createdAt: Date | null;
}

export function LocationsSection({
  locations,
  businessId,
}: {
  locations: Location[];
  businessId: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("businessId", String(businessId));
      await createLocation(formData);
      toast.success("Ubicación creada");
      setOpen(false);
    } catch {
      toast.error("Error al crear ubicación");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(locationId: number) {
    if (!confirm("¿Eliminar esta ubicación?")) return;
    try {
      await deleteLocation(locationId, businessId);
      toast.success("Ubicación eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Ubicaciones</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button variant="outline" className="text-orange-500 border-orange-500">
              + Nueva Ubicación
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Ubicación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="name" required placeholder="Sucursal Centro" />
              </div>
              <div className="space-y-2">
                <Label>Dirección</Label>
                <Input name="address" placeholder="Calle 123" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input name="city" placeholder="Buenos Aires" />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input name="country" defaultValue="ar" placeholder="ar" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {loading ? "Creando..." : "Crear Ubicación"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NOMBRE</TableHead>
              <TableHead>DIRECCIÓN</TableHead>
              <TableHead>CIUDAD</TableHead>
              <TableHead>PAÍS</TableHead>
              <TableHead>ACCIONES</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id}>
                <TableCell className="font-medium">{loc.name}</TableCell>
                <TableCell>{loc.address || "—"}</TableCell>
                <TableCell>{loc.city || "—"}</TableCell>
                <TableCell>{loc.country || "—"}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDelete(loc.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
