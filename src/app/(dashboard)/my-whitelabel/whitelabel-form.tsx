"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAgency } from "@/lib/actions/agency";
import { toast } from "sonner";

interface Agency {
  id: number;
  name: string;
  appName: string;
  logoUrl: string | null;
}

export function WhitelabelForm({ agency }: { agency: Agency }) {
  const [name, setName] = useState(agency.name);
  const [appName, setAppName] = useState(agency.appName);
  const [logoUrl, setLogoUrl] = useState(agency.logoUrl || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        setLogoUrl(data.url);
        toast.success("Logo subido");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Error al subir logo");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("appName", appName);
      if (logoUrl) formData.set("logoUrl", logoUrl);
      await updateAgency(formData);
      toast.success("Cambios guardados");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de la Agencia</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Nombre de la Agencia</Label>
          <p className="text-xs text-muted-foreground">
            Este nombre aparecerá en los pases de los clientes
          </p>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Nombre de la App</Label>
          <p className="text-xs text-muted-foreground">
            Este nombre aparecerá cuando los clientes entren a la app
          </p>
          <Input value={appName} onChange={(e) => setAppName(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Logo de la Agencia</Label>
          <p className="text-xs text-muted-foreground">
            PNG, JPG o WEBP. Máximo 2MB
          </p>
          <div className="flex items-center gap-4">
            {logoUrl && (
              <img
                src={logoUrl}
                alt="Logo"
                className="h-16 w-16 rounded-md object-cover border"
              />
            )}
            <div>
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoUpload}
                disabled={uploading}
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardContent>
    </Card>
  );
}
