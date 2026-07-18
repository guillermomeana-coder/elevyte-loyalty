"use client";

import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updatePassDesign } from "@/lib/actions/pass-design";
import { toast } from "sonner";

interface Design {
  backgroundColor: string;
  foregroundColor: string;
  labelColor: string;
  backgroundImage: string | null;
  logoImage: string | null;
  stripImage: string | null;
}

interface Props {
  cardId: number;
  cardType: string;
  cardName: string;
  totalStamps: number;
  design: Design;
}

export function Builder({ cardId, cardType, cardName, totalStamps, design: initial }: Props) {
  const [bgColor, setBgColor] = useState(initial.backgroundColor);
  const [fgColor, setFgColor] = useState(initial.foregroundColor);
  const [labelColor, setLabelColor] = useState(initial.labelColor);
  const [logoImage, setLogoImage] = useState(initial.logoImage || "");
  const [stripImage, setStripImage] = useState(initial.stripImage || "");
  const [saving, setSaving] = useState(false);
  const [activeColor, setActiveColor] = useState<"bg" | "fg" | "label">("bg");

  const colorValue = activeColor === "bg" ? bgColor : activeColor === "fg" ? fgColor : labelColor;
  const setColorValue = activeColor === "bg" ? setBgColor : activeColor === "fg" ? setFgColor : setLabelColor;

  async function handleUpload(field: "logo" | "strip", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (res.ok) {
      if (field === "logo") setLogoImage(data.url);
      else setStripImage(data.url);
      toast.success("Imagen subida");
    } else {
      toast.error(data.error);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updatePassDesign(cardId, {
        backgroundColor: bgColor,
        foregroundColor: fgColor,
        labelColor,
        logoImage: logoImage || null,
        stripImage: stripImage || null,
      });
      toast.success("Diseño guardado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Colores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              {[
                { key: "bg" as const, label: "Fondo", color: bgColor },
                { key: "fg" as const, label: "Texto", color: fgColor },
                { key: "label" as const, label: "Labels", color: labelColor },
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActiveColor(c.key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                    activeColor === c.key ? "border-orange-500" : "border-gray-200"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm">{c.label}</span>
                </button>
              ))}
            </div>
            <HexColorPicker color={colorValue} onChange={setColorValue} className="w-full" />
            <Input
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="font-mono"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Imágenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Logo (esquina superior)</Label>
              <div className="flex items-center gap-3">
                {logoImage && (
                  <img src={logoImage} alt="Logo" className="h-10 w-10 rounded object-cover" />
                )}
                <Input type="file" accept="image/*" onChange={(e) => handleUpload("logo", e)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Imagen de fondo / Strip</Label>
              <div className="flex items-center gap-3">
                {stripImage && (
                  <img src={stripImage} alt="Strip" className="h-10 w-20 rounded object-cover" />
                )}
                <Input type="file" accept="image/*" onChange={(e) => handleUpload("strip", e)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          size="lg"
        >
          {saving ? "Guardando..." : "Guardar Diseño"}
        </Button>
      </div>

      {/* Preview */}
      <div>
        <Tabs defaultValue="ios">
          <TabsList>
            <TabsTrigger value="ios">iOS</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
          </TabsList>
          <TabsContent value="ios" className="mt-4">
            <div
              className="rounded-2xl overflow-hidden shadow-xl max-w-xs mx-auto"
              style={{ backgroundColor: bgColor }}
            >
              {/* Header */}
              <div className="p-4 flex items-center justify-between">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded bg-white/20" />
                )}
                <div className="text-right">
                  <p className="text-xs" style={{ color: labelColor }}>NOMBRE</p>
                  <p className="font-bold" style={{ color: fgColor }}>Cliente</p>
                </div>
              </div>

              {/* Strip image */}
              {stripImage && (
                <img src={stripImage} alt="Strip" className="w-full h-32 object-cover" />
              )}

              {/* Content */}
              <div className="p-4">
                {cardType === "stamps" ? (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Array.from({ length: totalStamps }).map((_, i) => (
                      <span
                        key={i}
                        className="h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs"
                        style={{
                          borderColor: fgColor,
                          color: i < 4 ? fgColor : `${fgColor}40`,
                        }}
                      >
                        ☕
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                        style={{
                          backgroundColor: n === 1 ? fgColor : `${fgColor}30`,
                          color: n === 1 ? bgColor : fgColor,
                        }}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 flex justify-between text-xs" style={{ color: labelColor }}>
                <div>
                  <p>{cardType === "stamps" ? "ESTAMPILLAS TOTALES" : "NIVEL ACTUAL"}</p>
                  <p className="text-lg font-bold" style={{ color: fgColor }}>
                    {cardType === "stamps" ? totalStamps : "1"}
                  </p>
                </div>
                <div className="text-right">
                  <p>{cardType === "stamps" ? "COMPLETADAS" : "NIVELES"}</p>
                  <p className="text-lg font-bold" style={{ color: fgColor }}>
                    {cardType === "stamps" ? "0" : "5"}
                  </p>
                </div>
              </div>

              {/* QR */}
              <div className="p-4 flex justify-center">
                <div
                  className="h-24 w-24 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${fgColor}20` }}
                >
                  📱
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="android" className="mt-4">
            <div
              className="rounded-2xl overflow-hidden shadow-xl max-w-xs mx-auto p-4"
              style={{ backgroundColor: bgColor }}
            >
              <div className="flex items-center gap-3 mb-4">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="h-8 w-8 rounded object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded bg-white/20" />
                )}
                <p className="font-bold" style={{ color: fgColor }}>{cardName}</p>
              </div>
              {stripImage && (
                <img src={stripImage} alt="Strip" className="w-full h-28 rounded-lg object-cover mb-4" />
              )}
              <div className="space-y-2">
                <p className="text-xs" style={{ color: labelColor }}>MIEMBRO</p>
                <p className="font-semibold" style={{ color: fgColor }}>Cliente</p>
                {cardType === "stamps" ? (
                  <>
                    <p className="text-xs mt-3" style={{ color: labelColor }}>SELLOS</p>
                    <p className="text-2xl font-bold" style={{ color: fgColor }}>4/{totalStamps}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs mt-3" style={{ color: labelColor }}>GASTO TOTAL</p>
                    <p className="text-2xl font-bold" style={{ color: fgColor }}>ARS $37,000</p>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
