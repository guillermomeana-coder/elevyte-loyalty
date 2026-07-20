"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { updateLoyaltyCard } from "@/lib/actions/loyalty-cards";

interface Props {
  card: {
    id: number;
    name: string;
    type: string;
    geopushEnabled: boolean | null;
    geopushMessage: string | null;
    geopushLatitude: string | null;
    geopushLongitude: string | null;
    geopushRadiusMeters: number | null;
  };
  enrollmentCount: number;
  enrollments: {
    id: number;
    customerFirstName: string | null;
    customerLastName: string | null;
    customerPhone: string | null;
    customerEmail: string | null;
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
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [geopushEnabled, setGeopushEnabled] = useState(card.geopushEnabled || false);
  const [geopushMessage, setGeopushMessage] = useState(card.geopushMessage || "");
  const [geopushLat, setGeopushLat] = useState(card.geopushLatitude || "");
  const [geopushLng, setGeopushLng] = useState(card.geopushLongitude || "");
  const [geopushRadius, setGeopushRadius] = useState(card.geopushRadiusMeters || 200);
  const [savingGeo, setSavingGeo] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const mainLink = links[0];
  const registrationUrl = mainLink
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/register/${mainLink.slug}`
    : "";

  useEffect(() => {
    if (registrationUrl) {
      import("qrcode").then((QRCode) => {
        QRCode.toDataURL(registrationUrl, {
          width: 200,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        }).then(setQrDataUrl);
      });
    }
  }, [registrationUrl]);

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    toast.success("Copiado al portapapeles");
    setTimeout(() => setCopiedLink(null), 2000);
  }

  async function saveGeopush() {
    setSavingGeo(true);
    try {
      await updateLoyaltyCard(card.id, {
        geopushEnabled,
        geopushMessage,
        geopushLatitude: geopushLat || null,
        geopushLongitude: geopushLng || null,
        geopushRadiusMeters: geopushRadius,
      });
      toast.success("Geopush actualizado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSavingGeo(false);
    }
  }

  const totalVisits = enrollments.reduce((sum, e) => sum + (e.totalVisits || 0), 0);

  return (
    <div className="space-y-6 mt-4">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total de Clientes", value: enrollmentCount, color: "orange" },
          { label: "Total de Visitas", value: totalVisits, color: "blue" },
          { label: "Total de Registros", value: enrollmentCount, color: "emerald" },
          { label: "Total de Acciones", value: totalVisits, color: "purple" },
        ].map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Share + QR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Comparte tu tarjeta</CardTitle>
            <p className="text-xs text-muted-foreground">Utiliza el enlace o el codigo QR</p>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Fuente</TableHead>
                  <TableHead className="text-xs">Enlace</TableHead>
                  <TableHead className="text-xs">Clics</TableHead>
                  <TableHead className="text-xs">Registros</TableHead>
                  <TableHead className="text-xs">Conversion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link, i) => {
                  const conv = link.clicks && link.clicks > 0
                    ? ((link.registrations || 0) / link.clicks * 100).toFixed(1) : "0.0";
                  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/register/${link.slug}`;
                  return (
                    <TableRow key={link.id}>
                      <TableCell className="text-sm font-medium">{i + 1}#</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">{url}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => copyToClipboard(url, link.slug)}
                          >
                            {copiedLink === link.slug ? "Copiado!" : "Copiar"}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{link.clicks || 0}</TableCell>
                      <TableCell className="font-medium">{link.registrations || 0}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{conv}%</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Codigo QR</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {qrDataUrl ? (
              <div className="bg-white p-4 rounded-2xl shadow-inner border">
                <img src={qrDataUrl} alt="QR Code" className="h-40 w-40" />
              </div>
            ) : (
              <div className="h-40 w-40 bg-gray-100 rounded-2xl animate-pulse" />
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">Tu proximo cliente</p>
            {registrationUrl && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs"
                onClick={() => copyToClipboard(registrationUrl, "qr")}
              >
                {copiedLink === "qr" ? "Copiado!" : "Copiar enlace"}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Geopush */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-base">Geopush</CardTitle>
                <p className="text-xs text-muted-foreground">Notificacion automatica cuando el cliente esta cerca</p>
              </div>
            </div>
            <Badge
              variant={geopushEnabled ? "default" : "secondary"}
              className={`cursor-pointer transition-colors ${geopushEnabled ? "bg-emerald-500 hover:bg-emerald-600" : "hover:bg-gray-200"}`}
              onClick={() => setGeopushEnabled(!geopushEnabled)}
            >
              {geopushEnabled ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardHeader>
        {geopushEnabled && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Mensaje de notificacion</Label>
              <Input
                value={geopushMessage}
                onChange={(e) => setGeopushMessage(e.target.value)}
                placeholder="Estas cerca! Pasa por tu cafe y suma puntos"
                className="text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Latitud</Label>
                <Input
                  value={geopushLat}
                  onChange={(e) => setGeopushLat(e.target.value)}
                  placeholder="-31.5375"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Longitud</Label>
                <Input
                  value={geopushLng}
                  onChange={(e) => setGeopushLng(e.target.value)}
                  placeholder="-68.5364"
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Radio (metros)</Label>
                <Input
                  type="number"
                  min={50}
                  max={5000}
                  value={geopushRadius}
                  onChange={(e) => setGeopushRadius(Number(e.target.value))}
                  className="text-sm"
                />
              </div>
            </div>

            {/* Map */}
            {geopushLat && geopushLng && (
              <div className="rounded-xl overflow-hidden border shadow-inner">
                <div className="relative h-64 bg-gray-100">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(geopushLng)-0.008},${Number(geopushLat)-0.005},${Number(geopushLng)+0.008},${Number(geopushLat)+0.005}&layer=mapnik&marker=${geopushLat},${geopushLng}`}
                    className="w-full h-full border-0"
                    title="Mapa geopush"
                  />
                  {/* Radius overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="rounded-full border-2 border-orange-500/40 bg-orange-500/10 animate-pulse"
                      style={{
                        width: Math.min(Math.max(geopushRadius / 2, 60), 220),
                        height: Math.min(Math.max(geopushRadius / 2, 60), 220),
                      }}
                    />
                  </div>
                </div>
                <div className="bg-white px-4 py-2 text-xs text-muted-foreground flex justify-between border-t">
                  <span>Radio: {geopushRadius}m</span>
                  <span>{geopushLat}, {geopushLng}</span>
                </div>
              </div>
            )}

            {/* Push notification preview */}
            <div className="bg-gray-50 rounded-xl p-4 border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Preview de notificacion</p>
              <div className="bg-white rounded-xl p-3 shadow-sm border flex items-start gap-3 max-w-sm">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">
                  {card.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide">{card.name}</p>
                    <p className="text-[10px] text-muted-foreground ml-2">Ahora</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {geopushMessage || "Estas cerca! Pasa y suma puntos"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={saveGeopush}
              disabled={savingGeo}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              size="sm"
            >
              {savingGeo ? "Guardando..." : "Guardar Geopush"}
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Recent Clients */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Clientes Recientes</CardTitle>
            <span className="text-xs text-muted-foreground">
              Mostrando los {enrollments.length} clientes mas recientes
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <div className="text-center py-12">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">Aun no hay clientes registrados</p>
              <p className="text-xs text-muted-foreground mt-1">Comparte tu enlace de registro para empezar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Nombre</TableHead>
                  <TableHead className="text-xs">Apellido</TableHead>
                  <TableHead className="text-xs">Telefono</TableHead>
                  <TableHead className="text-xs">Ultima Visita</TableHead>
                  <TableHead className="text-xs">Total Visitas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.customerFirstName || "—"}</TableCell>
                    <TableCell>{e.customerLastName || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{e.customerPhone || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {e.lastVisitAt ? new Date(e.lastVisitAt).toLocaleDateString("es-AR") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">{e.totalVisits || 0}</Badge>
                    </TableCell>
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
