"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createPushMessage, sendPushMessage } from "@/lib/actions/push-messages";
import { toast } from "sonner";

interface PushMessage {
  id: number;
  title: string | null;
  body: string;
  status: string | null;
  sentAt: Date | null;
  deliveredCount: number | null;
  createdAt: Date | null;
}

export function TabPushMessages({
  messages,
  cardId,
}: {
  messages: PushMessage[];
  cardId: number;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<number | null>(null);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      formData.set("cardId", String(cardId));
      await createPushMessage(formData);
      toast.success("Mensaje creado");
      setOpen(false);
    } catch {
      toast.error("Error al crear mensaje");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend(messageId: number) {
    setSending(messageId);
    try {
      const result = await sendPushMessage(messageId, cardId);
      toast.success(`Enviado a ${result.delivered} clientes`);
    } catch {
      toast.error("Error al enviar");
    } finally {
      setSending(null);
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mensajes Push</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <Button variant="outline" className="text-orange-500 border-orange-500">
              + Nuevo Mensaje
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Mensaje Push</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input name="title" required placeholder="Promoción especial" />
              </div>
              <div className="space-y-2">
                <Label>Contenido</Label>
                <textarea
                  name="body"
                  required
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="¡Hoy tenemos 2x1 en cafés!"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {loading ? "Creando..." : "Crear Mensaje"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contenido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último envío</TableHead>
                <TableHead>Entregados</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((msg) => (
                <TableRow key={msg.id}>
                  <TableCell>
                    <p className="font-medium">{msg.title || "Sin título"}</p>
                    <p className="text-sm text-muted-foreground truncate max-w-xs">
                      {msg.body}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={msg.status === "sent" ? "default" : "secondary"}
                      className={msg.status === "sent" ? "bg-green-500" : ""}
                    >
                      {msg.status || "draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {msg.sentAt
                      ? new Date(msg.sentAt).toLocaleDateString("es-AR")
                      : "—"}
                  </TableCell>
                  <TableCell>{msg.deliveredCount || 0} clientes</TableCell>
                  <TableCell>
                    {msg.status === "draft" && (
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white"
                        disabled={sending === msg.id}
                        onClick={() => handleSend(msg.id)}
                      >
                        {sending === msg.id ? "Enviando..." : "Enviar"}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No hay mensajes push. Crea uno para empezar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
