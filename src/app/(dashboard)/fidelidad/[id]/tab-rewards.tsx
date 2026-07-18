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
import { createReward, deleteReward } from "@/lib/actions/rewards";
import { toast } from "sonner";

interface Reward {
  id: number;
  name: string;
  stampsRequired: number | null;
  levelId: number | null;
  expiryDays: number | null;
  isActive: boolean | null;
}

interface Level {
  id: number;
  name: string;
}

export function TabRewards({
  rewards,
  cardId,
  cardType,
  levels,
}: {
  rewards: Reward[];
  cardId: number;
  cardType: string;
  levels: Level[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("cardId", String(cardId));
      await createReward(formData);
      toast.success("Recompensa creada");
      setOpen(false);
    } catch {
      toast.error("Error al crear recompensa");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(rewardId: number) {
    if (!confirm("¿Eliminar esta recompensa?")) return;
    try {
      await deleteReward(rewardId, cardId);
      toast.success("Recompensa eliminada");
    } catch {
      toast.error("Error al eliminar");
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Recompensas</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button variant="outline" className="text-orange-500 border-orange-500">
              + Crear recompensa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Recompensa</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input name="name" required placeholder="Café gratis" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input name="description" placeholder="Opcional" />
              </div>
              {cardType === "stamps" && (
                <div className="space-y-2">
                  <Label>Estampillas necesarias</Label>
                  <Input name="stampsRequired" type="number" min={1} required />
                </div>
              )}
              {cardType === "levels" && (
                <div className="space-y-2">
                  <Label>Nivel requerido</Label>
                  <select name="levelId" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Sin nivel específico</option>
                    {levels.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-2">
                <Label>Plazo (días)</Label>
                <Input name="expiryDays" type="number" placeholder="Sin límite" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {loading ? "Creando..." : "Crear Recompensa"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>{cardType === "stamps" ? "Estampillas" : "Nivel"}</TableHead>
                <TableHead>Plazo (días)</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>
                    {cardType === "stamps"
                      ? `${r.stampsRequired} estampillas`
                      : levels.find((l) => l.id === r.levelId)?.name || "—"}
                  </TableCell>
                  <TableCell>{r.expiryDays || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDelete(r.id)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rewards.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay recompensas. Crea una para empezar.
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
