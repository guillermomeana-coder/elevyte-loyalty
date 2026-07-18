"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { createLoyaltyCard } from "@/lib/actions/loyalty-cards";
import { toast } from "sonner";

export function CreateCardDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"stamps" | "levels">("stamps");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("type", type);
      const card = await createLoyaltyCard(formData);
      toast.success("Tarjeta creada");
      setOpen(false);
      router.push(`/fidelidad/${card.id}`);
    } catch {
      toast.error("Error al crear tarjeta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white">
          Crear programa
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo programa de lealtad</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Tipo de programa</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType("stamps")}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  type === "stamps"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold">☕ Estampillas</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Junta sellos y gana premios
                </p>
              </button>
              <button
                type="button"
                onClick={() => setType("levels")}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  type === "levels"
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-semibold">⭐ Niveles</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sube de nivel gastando más
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nombre del programa</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="Club de Mi Negocio"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {loading ? "Creando..." : "Crear Programa"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
