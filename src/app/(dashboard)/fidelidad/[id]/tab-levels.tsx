"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createLevel, deleteLevel } from "@/lib/actions/levels";
import { toast } from "sonner";

interface Level {
  id: number;
  name: string;
  sortOrder: number;
  minSpend: string;
  isInitial: boolean | null;
}

export function TabLevels({ levels, cardId }: { levels: Level[]; cardId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("cardId", String(cardId));
      await createLevel(formData);
      toast.success("Nivel creado");
      setOpen(false);
    } catch {
      toast.error("Error al crear nivel");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(levelId: number) {
    if (!confirm("¿Eliminar este nivel?")) return;
    try {
      await deleteLevel(levelId, cardId);
      toast.success("Nivel eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Niveles</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button variant="outline" className="text-orange-500 border-orange-500">
              + Crear nuevo nivel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Nivel</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre del nivel</Label>
                <Input name="name" required placeholder="Nivel Gold" />
              </div>
              <div className="space-y-2">
                <Label>Gasto mínimo (ARS)</Label>
                <Input name="minSpend" type="number" min={0} required placeholder="50000" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {loading ? "Creando..." : "Crear Nivel"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {levels.map((level) => (
          <Card key={level.id}>
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{level.name}</p>
                  {level.isInitial && (
                    <Badge variant="secondary">Inicial</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {level.isInitial
                    ? "Aquí inician tus clientes. No requiere gasto mínimo."
                    : `Los clientes alcanzan este nivel al gastar: $${Number(level.minSpend).toLocaleString()} ARS`}
                </p>
              </div>
              {!level.isInitial && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() => handleDelete(level.id)}
                >
                  Eliminar
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
