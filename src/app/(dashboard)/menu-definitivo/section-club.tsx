"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateClubInvitation } from "@/lib/actions/menus";
import { toast } from "sonner";

interface Invitation {
  title: string | null;
  description: string | null;
  buttonText: string | null;
  isEnabled: boolean | null;
}

export function SectionClub({ invitation }: { invitation: Invitation | null }) {
  const [title, setTitle] = useState(invitation?.title || "¡Únete a Nuestro Club!");
  const [description, setDescription] = useState(
    invitation?.description || "Únete a nuestro exclusivo club de beneficios y disfruta de ofertas especiales"
  );
  const [buttonText, setButtonText] = useState(invitation?.buttonText || "Unirse ahora");
  const [enabled, setEnabled] = useState(invitation?.isEnabled ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("title", title);
      formData.set("description", description);
      formData.set("buttonText", buttonText);
      formData.set("isEnabled", String(enabled));
      await updateClubInvitation(formData);
      toast.success("Invitación actualizada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Invitación a Club</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gestiona tus pop-ups, invita a los clientes a tu programa de fidelización.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="border rounded-lg p-6 text-center space-y-3 bg-gray-50">
          <h3 className="text-lg font-bold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            {buttonText}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Label>Habilitado</Label>
            <Button
              size="sm"
              variant={enabled ? "default" : "outline"}
              className={enabled ? "bg-green-500" : ""}
              onClick={() => setEnabled(!enabled)}
            >
              {enabled ? "Sí" : "No"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <textarea
              className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Texto del botón</Label>
            <Input value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </CardContent>
    </Card>
  );
}
