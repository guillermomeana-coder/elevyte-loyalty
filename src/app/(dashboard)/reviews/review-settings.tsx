"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { updateReviewSettings } from "@/lib/actions/reviews";
import { toast } from "sonner";

interface Props {
  googlePlaceId: string;
  googleReviewUrl: string;
  reviewRequestEnabled: boolean;
  reviewRequestAfterVisits: number;
  reviewRequestMessage: string;
  businessName: string;
}

export function ReviewSettings({
  googlePlaceId: initialPlaceId,
  googleReviewUrl: initialReviewUrl,
  reviewRequestEnabled: initialEnabled,
  reviewRequestAfterVisits: initialAfterVisits,
  reviewRequestMessage: initialMessage,
  businessName,
}: Props) {
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [afterVisits, setAfterVisits] = useState(initialAfterVisits);
  const [message, setMessage] = useState(
    initialMessage || `Hola! Gracias por visitar ${businessName}. Nos encantaria que nos dejes una resena en Google. Tu opinion nos ayuda a mejorar!`
  );
  const [saving, setSaving] = useState(false);

  const reviewUrl = placeId
    ? `https://search.google.com/local/writereview?placeid=${placeId}`
    : "";

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("googlePlaceId", placeId);
      formData.set("reviewRequestEnabled", String(enabled));
      formData.set("reviewRequestAfterVisits", String(afterVisits));
      formData.set("reviewRequestMessage", message);
      await updateReviewSettings(formData);
      toast.success("Configuracion guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Step 1: Connect Google Business */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            <div>
              <CardTitle className="text-base">Conectar Google Business</CardTitle>
              <p className="text-xs text-muted-foreground">
                Vincula tu negocio para recibir resenas automaticamente
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Google Place ID</Label>
            <div className="flex gap-2">
              <Input
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                placeholder="ChIJ..."
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                className="flex-shrink-0 text-xs"
                onClick={() => window.open("https://developers.google.com/maps/documentation/places/web-service/place-id-finder", "_blank")}
              >
                Buscar Place ID
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Busca tu negocio en Google Maps, copia el Place ID desde el enlace de arriba
            </p>
          </div>

          {placeId && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <p className="text-sm font-medium text-emerald-700">Google Business conectado</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-emerald-600">
                  Link de resena:
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-[11px] bg-emerald-100 px-2 py-1 rounded font-mono text-emerald-700 truncate flex-1">
                    {reviewUrl}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-emerald-600"
                    onClick={() => {
                      navigator.clipboard.writeText(reviewUrl);
                      toast.success("Link copiado");
                    }}
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Automation config */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-base">Pedido automatico de resenas</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Envia automaticamente un pedido de resena despues de N visitas
                </p>
              </div>
            </div>
            <Badge
              variant={enabled ? "default" : "secondary"}
              className={`cursor-pointer transition-colors ${enabled ? "bg-emerald-500 hover:bg-emerald-600" : "hover:bg-gray-200"}`}
              onClick={() => setEnabled(!enabled)}
            >
              {enabled ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardHeader>
        {enabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pedir resena despues de cuantas visitas?</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={afterVisits}
                  onChange={(e) => setAfterVisits(Number(e.target.value))}
                  className="w-24 text-center text-lg font-bold"
                />
                <span className="text-sm text-muted-foreground">visitas del cliente</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                El cliente recibira una notificacion push con el link de resena despues de su visita #{afterVisits}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mensaje del pedido de resena</Label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                placeholder="Hola! Nos encantaria que nos dejes una resena..."
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Preview: asi lo vera el cliente</p>

              {/* Phone notification */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border max-w-sm mx-auto">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {businessName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide">{businessName}</p>
                      <p className="text-[10px] text-muted-foreground">Ahora</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{message}</p>
                    {placeId && (
                      <Button
                        size="sm"
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg h-8"
                        onClick={() => window.open(reviewUrl, "_blank")}
                      >
                        <svg className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Dejar resena en Google
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stars preview */}
              <div className="flex justify-center gap-1 mt-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="h-6 w-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ))}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* How it works */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Como funciona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Cliente visita",
                desc: "El worker escanea el QR del cliente y suma sellos/puntos",
              },
              {
                step: "2",
                title: "Se alcanza el trigger",
                desc: `Despues de ${afterVisits} visitas, se dispara automaticamente`,
              },
              {
                step: "3",
                title: "Push de resena",
                desc: "El cliente recibe una notificacion con el link directo a Google Reviews",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-11 rounded-xl font-medium shadow-lg shadow-orange-500/20"
        size="lg"
      >
        {saving ? "Guardando..." : "Guardar configuracion"}
      </Button>
    </div>
  );
}
