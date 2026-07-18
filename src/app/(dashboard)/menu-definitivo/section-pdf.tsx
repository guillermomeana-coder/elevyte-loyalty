"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { uploadMenuPdf, deleteMenuPdf } from "@/lib/actions/menus";
import { toast } from "sonner";

interface Pdf {
  id: number;
  fileUrl: string;
  fileName: string | null;
}

export function SectionPdf({ pdfs }: { pdfs: Pdf[] }) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }

      const menuForm = new FormData();
      menuForm.set("fileUrl", data.url);
      menuForm.set("fileName", file.name);
      await uploadMenuPdf(menuForm);
      toast.success("Menú subido");
    } catch {
      toast.error("Error al subir");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este PDF?")) return;
    await deleteMenuPdf(id);
    toast.success("PDF eliminado");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Catálogo PDF</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gestiona tus catálogos en formato PDF aquí.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {pdfs.map((pdf) => (
          <div key={pdf.id} className="flex items-center justify-between p-2 border rounded">
            <a href={pdf.fileUrl} target="_blank" className="text-sm text-blue-600 hover:underline truncate">
              {pdf.fileName || "Menú"}
            </a>
            <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDelete(pdf.id)}>
              ✕
            </Button>
          </div>
        ))}
        <Input type="file" accept="application/pdf,image/*" onChange={handleUpload} disabled={uploading} />
        {uploading && <p className="text-sm text-muted-foreground">Subiendo...</p>}
      </CardContent>
    </Card>
  );
}
