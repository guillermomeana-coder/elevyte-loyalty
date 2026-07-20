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
      toast.success("Diseno guardado");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Controls */}
      <div className="space-y-5">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Colores del pass</CardTitle>
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                    activeColor === c.key
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10"
                      : "border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-gray-200 shadow-inner"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-xs font-medium">{c.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4 items-start">
              <HexColorPicker color={colorValue} onChange={setColorValue} style={{ width: "100%", height: 180 }} />
            </div>
            <Input
              value={colorValue}
              onChange={(e) => setColorValue(e.target.value)}
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Imagenes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Logo del negocio</Label>
              <div className="flex items-center gap-3">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="h-12 w-12 rounded-xl object-cover shadow-sm border" />
                ) : (
                  <div className="h-12 w-12 rounded-xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    Logo
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={(e) => handleUpload("logo", e)} className="text-sm" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Imagen de fondo</Label>
              <div className="flex items-center gap-3">
                {stripImage ? (
                  <img src={stripImage} alt="Strip" className="h-12 w-24 rounded-lg object-cover shadow-sm border" />
                ) : (
                  <div className="h-12 w-24 rounded-lg bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                    Fondo
                  </div>
                )}
                <Input type="file" accept="image/*" onChange={(e) => handleUpload("strip", e)} className="text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-11 rounded-xl font-medium shadow-lg shadow-orange-500/20"
        >
          {saving ? "Guardando..." : "Guardar Diseno"}
        </Button>
      </div>

      {/* Preview */}
      <div>
        <Tabs defaultValue="ios">
          <TabsList className="mb-4">
            <TabsTrigger value="ios">iPhone</TabsTrigger>
            <TabsTrigger value="android">Android</TabsTrigger>
          </TabsList>

          <TabsContent value="ios">
            {/* iPhone frame */}
            <div className="mx-auto" style={{ maxWidth: 320 }}>
              <div className="rounded-[3rem] border-[6px] border-gray-800 bg-gray-900 p-2 shadow-2xl">
                {/* Notch */}
                <div className="flex justify-center mb-1">
                  <div className="h-6 w-28 bg-gray-800 rounded-b-2xl" />
                </div>
                {/* Screen */}
                <div className="rounded-[2.2rem] overflow-hidden bg-gray-100">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-6 py-2 bg-gray-100">
                    <span className="text-[11px] font-semibold text-gray-800">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="flex gap-[2px]">{[1,2,3,4].map(i => <div key={i} className="w-[3px] h-[10px] bg-gray-800 rounded-sm" style={{height: 4+i*2}} />)}</div>
                      <span className="text-[11px] font-semibold text-gray-800 ml-1">100%</span>
                    </div>
                  </div>

                  {/* Wallet header */}
                  <div className="px-4 py-2 flex items-center justify-between bg-gray-100">
                    <span className="text-blue-500 text-sm font-medium">Done</span>
                    <div className="flex gap-3">
                      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                      <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
                    </div>
                  </div>

                  {/* THE PASS */}
                  <div className="px-3 pb-6">
                    <div className="rounded-2xl overflow-hidden shadow-xl" style={{ backgroundColor: bgColor }}>
                      {/* Pass header */}
                      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {logoImage ? (
                            <img src={logoImage} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-xs font-bold" style={{ color: fgColor }}>
                              {cardName.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: labelColor }}>CLIENTE</p>
                            <p className="text-sm font-bold" style={{ color: fgColor }}>Sofia Martinez</p>
                          </div>
                        </div>
                      </div>

                      {/* Strip image */}
                      {stripImage ? (
                        <img src={stripImage} alt="Strip" className="w-full h-28 object-cover" />
                      ) : (
                        <div className="w-full h-28 bg-black/10" />
                      )}

                      {/* Stamps or levels */}
                      <div className="px-4 py-4">
                        {cardType === "stamps" ? (
                          <div className="flex flex-wrap gap-2 justify-center">
                            {Array.from({ length: totalStamps }).map((_, i) => (
                              <div
                                key={i}
                                className="h-9 w-9 rounded-full flex items-center justify-center text-sm transition-all"
                                style={{
                                  backgroundColor: i < 4 ? `${fgColor}30` : `${fgColor}10`,
                                  border: `2px solid ${i < 4 ? fgColor : `${fgColor}30`}`,
                                }}
                              >
                                <span style={{ color: i < 4 ? fgColor : `${fgColor}40` }}>
                                  {i < 4 ? "✓" : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className="h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                                style={{
                                  backgroundColor: n <= 2 ? fgColor : `${fgColor}15`,
                                  color: n <= 2 ? bgColor : `${fgColor}50`,
                                  border: `2px solid ${n <= 2 ? fgColor : `${fgColor}25`}`,
                                }}
                              >
                                {n}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="px-4 pb-3 flex justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: labelColor }}>
                            {cardType === "stamps" ? "SELLOS TOTALES" : "GASTO TOTAL"}
                          </p>
                          <p className="text-xl font-bold" style={{ color: fgColor }}>
                            {cardType === "stamps" ? totalStamps : "ARS $37,000"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: labelColor }}>
                            {cardType === "stamps" ? "COMPLETADOS" : "NIVEL"}
                          </p>
                          <p className="text-xl font-bold" style={{ color: fgColor }}>
                            {cardType === "stamps" ? "4" : "Semilla"}
                          </p>
                        </div>
                      </div>

                      {/* QR */}
                      <div className="px-4 pb-4 flex justify-center">
                        <div className="bg-white rounded-xl p-3 shadow-inner">
                          <div className="h-20 w-20 bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:8px_8px] rounded" />
                        </div>
                      </div>

                      {/* Bottom branding */}
                      <div className="px-4 pb-3 text-center">
                        <p className="text-[9px] uppercase tracking-widest font-medium" style={{ color: `${fgColor}50` }}>
                          By Elevyte Loyalty
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex justify-center gap-1.5 pb-4">
                    {[0,1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 rounded-full ${i === 0 ? "w-4 bg-gray-600" : "w-1.5 bg-gray-300"}`} />
                    ))}
                  </div>
                </div>
                {/* Home bar */}
                <div className="flex justify-center mt-2 pb-1">
                  <div className="h-1 w-28 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="android">
            {/* Android frame */}
            <div className="mx-auto" style={{ maxWidth: 320 }}>
              <div className="rounded-[2rem] border-[4px] border-gray-800 bg-gray-900 p-2 shadow-2xl">
                {/* Camera hole */}
                <div className="flex justify-center mb-1">
                  <div className="h-4 w-4 bg-gray-800 rounded-full" />
                </div>
                <div className="rounded-[1.5rem] overflow-hidden bg-[#1a1a1a]">
                  {/* Status bar */}
                  <div className="flex justify-between items-center px-5 py-2">
                    <span className="text-[11px] text-white/60">9:41</span>
                    <div className="flex items-center gap-2">
                      <div className="flex gap-[2px]">{[1,2,3,4].map(i => <div key={i} className="w-[3px] bg-white/60 rounded-sm" style={{height: 4+i*2}} />)}</div>
                      <span className="text-[11px] text-white/60">85%</span>
                    </div>
                  </div>

                  {/* Google Wallet header */}
                  <div className="px-5 py-3">
                    <p className="text-white/40 text-xs">Google Wallet</p>
                    <p className="text-white text-lg font-medium mt-0.5">{cardName}</p>
                  </div>

                  {/* Card */}
                  <div className="px-4 pb-6">
                    <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: bgColor }}>
                      <div className="px-5 pt-5 flex items-center gap-3">
                        {logoImage ? (
                          <img src={logoImage} alt="Logo" className="h-10 w-10 rounded-xl object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center text-xs font-bold" style={{ color: fgColor }}>
                            {cardName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm" style={{ color: fgColor }}>{cardName}</p>
                          <p className="text-[11px]" style={{ color: labelColor }}>Sofia Martinez</p>
                        </div>
                      </div>

                      {stripImage ? (
                        <img src={stripImage} alt="Banner" className="w-full h-24 object-cover mt-3" />
                      ) : (
                        <div className="w-full h-24 bg-black/10 mt-3" />
                      )}

                      <div className="px-5 py-4 space-y-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider" style={{ color: labelColor }}>
                            {cardType === "stamps" ? "SELLOS" : "GASTO TOTAL"}
                          </p>
                          <p className="text-2xl font-bold" style={{ color: fgColor }}>
                            {cardType === "stamps" ? `4/${totalStamps}` : "ARS $37,000"}
                          </p>
                        </div>
                        {cardType === "stamps" && (
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(totalStamps, 10) }).map((_, i) => (
                              <div
                                key={i}
                                className="flex-1 h-2 rounded-full"
                                style={{ backgroundColor: i < 4 ? fgColor : `${fgColor}20` }}
                              />
                            ))}
                          </div>
                        )}
                        {cardType === "levels" && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider" style={{ color: labelColor }}>NIVEL ACTUAL</p>
                            <p className="text-lg font-bold" style={{ color: fgColor }}>Semilla</p>
                          </div>
                        )}
                      </div>

                      <div className="px-5 pb-4 flex justify-center">
                        <div className="bg-white rounded-lg p-2.5">
                          <div className="h-16 w-16 bg-[repeating-conic-gradient(#000_0%_25%,#fff_0%_50%)] bg-[length:6px_6px] rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Nav pills */}
                  <div className="flex justify-center gap-6 pb-4">
                    {["Detalles", "Actividad", "Info"].map((t, i) => (
                      <span key={t} className={`text-xs ${i === 0 ? "text-blue-400 border-b border-blue-400 pb-1" : "text-white/30"}`}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-2 pb-1">
                  <div className="h-1 w-24 bg-gray-600 rounded-full" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
