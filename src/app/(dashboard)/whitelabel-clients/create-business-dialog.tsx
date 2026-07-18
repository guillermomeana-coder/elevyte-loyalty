"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBusiness } from "@/lib/actions/business";
import { toast } from "sonner";

export function CreateBusinessDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      await createBusiness(formData);
      toast.success("Negocio creado");
      setOpen(false);
    } catch {
      toast.error("Error al crear negocio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          + Nuevo Negocio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Negocio</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del negocio</Label>
            <Input id="name" name="name" required placeholder="Mi Restaurante" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="locationName">Nombre de la primera ubicación</Label>
            <Input
              id="locationName"
              name="locationName"
              placeholder="Sucursal Principal"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Creando..." : "Crear Negocio"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
