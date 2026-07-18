"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { deleteLoyaltyCard } from "@/lib/actions/loyalty-cards";
import { toast } from "sonner";

export function TabDanger({ cardId, cardName }: { cardId: number; cardName: string }) {
  const [confirmName, setConfirmName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (confirmName !== cardName) {
      toast.error("El nombre no coincide");
      return;
    }
    setLoading(true);
    try {
      await deleteLoyaltyCard(cardId);
    } catch {
      toast.error("Error al eliminar");
      setLoading(false);
    }
  }

  return (
    <div className="mt-4">
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Zona de peligro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Esta acción eliminará permanentemente la tarjeta, todos sus clientes,
            recompensas, niveles y datos asociados. Esta acción no se puede deshacer.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Escribe <strong>{cardName}</strong> para confirmar:
            </p>
            <Input
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={cardName}
            />
          </div>
          <Button
            variant="destructive"
            disabled={confirmName !== cardName || loading}
            onClick={handleDelete}
          >
            {loading ? "Eliminando..." : "Eliminar Tarjeta Permanentemente"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
