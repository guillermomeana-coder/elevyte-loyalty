"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateLoyaltyCard } from "@/lib/actions/loyalty-cards";
import { toast } from "sonner";

interface Props {
  card: {
    id: number;
    name: string;
    language: string | null;
    status: string | null;
    type: string;
    totalStamps: number | null;
    completionBehavior: string | null;
    currency: string | null;
    scanLimitEnabled: boolean | null;
    scanLimitCount: number | null;
    scanLimitPeriod: string | null;
    termsAndConditions: string | null;
    welcomeMessage: string | null;
    geopushEnabled: boolean | null;
    geopushMessage: string | null;
  };
}

export function TabConfiguration({ card }: Props) {
  const [name, setName] = useState(card.name);
  const [status, setStatus] = useState(card.status || "active");
  const [totalStamps, setTotalStamps] = useState(card.totalStamps || 10);
  const [currency, setCurrency] = useState(card.currency || "ARS");
  const [terms, setTerms] = useState(card.termsAndConditions || "");
  const [welcomeMsg, setWelcomeMsg] = useState(card.welcomeMessage || "");
  const [geopushEnabled, setGeopushEnabled] = useState(card.geopushEnabled || false);
  const [geopushMessage, setGeopushMessage] = useState(card.geopushMessage || "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const data: Record<string, unknown> = {
        name,
        status,
        termsAndConditions: terms,
        welcomeMessage: welcomeMsg,
        geopushEnabled,
        geopushMessage,
      };
      if (card.type === "stamps") data.totalStamps = totalStamps;
      if (card.type === "levels") data.currency = currency;

      await updateLoyaltyCard(card.id, data);
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Información básica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Idioma</Label>
              <Input value={card.language || "es"} disabled />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <div className="flex gap-2 mt-1">
                <Button
                  size="sm"
                  variant={status === "active" ? "default" : "outline"}
                  className={status === "active" ? "bg-green-500" : ""}
                  onClick={() => setStatus("active")}
                >
                  Activa
                </Button>
                <Button
                  size="sm"
                  variant={status === "inactive" ? "default" : "outline"}
                  onClick={() => setStatus("inactive")}
                >
                  Inactiva
                </Button>
              </div>
            </div>
          </div>

          {card.type === "stamps" && (
            <div className="space-y-2">
              <Label>Total de estampillas</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={totalStamps}
                onChange={(e) => setTotalStamps(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Comportamiento al completar:{" "}
                <Badge variant="outline">{card.completionBehavior || "reset"}</Badge>
              </p>
            </div>
          )}

          {card.type === "levels" && (
            <div className="space-y-2">
              <Label>Moneda</Label>
              <Input value={currency} onChange={(e) => setCurrency(e.target.value)} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Geopush</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Label>Habilitado</Label>
            <Button
              size="sm"
              variant={geopushEnabled ? "default" : "outline"}
              className={geopushEnabled ? "bg-green-500" : ""}
              onClick={() => setGeopushEnabled(!geopushEnabled)}
            >
              {geopushEnabled ? "Sí" : "No"}
            </Button>
          </div>
          {geopushEnabled && (
            <div className="space-y-2">
              <Label>Mensaje de Geopush</Label>
              <Input
                value={geopushMessage}
                onChange={(e) => setGeopushMessage(e.target.value)}
                placeholder="¡Estás cerca! Pasá y sumá puntos"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Términos y Condiciones</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensaje de Bienvenida</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={welcomeMsg}
            onChange={(e) => setWelcomeMsg(e.target.value)}
            placeholder="¡Bienvenido a nuestro programa!"
          />
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-orange-500 hover:bg-orange-600 text-white"
        size="lg"
      >
        {saving ? "Guardando..." : "Guardar Configuración"}
      </Button>
    </div>
  );
}
