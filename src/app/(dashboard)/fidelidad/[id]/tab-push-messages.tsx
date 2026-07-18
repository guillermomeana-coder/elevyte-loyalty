"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-semibold">Mensajes Push</h3>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contenido</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Último envío</TableHead>
                <TableHead>Entregados</TableHead>
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
                </TableRow>
              ))}
              {messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    No hay mensajes push enviados
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
