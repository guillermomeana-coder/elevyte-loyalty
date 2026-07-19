"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  paymentId: number;
  address: string;
  amount: string;
  planName: string;
  status: string;
  expiresAt: string;
}

export function CheckoutUI({ paymentId, address, amount, planName, status: initialStatus, expiresAt }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [copied, setCopied] = useState<"address" | "amount" | null>(null);
  const [timeLeft, setTimeLeft] = useState("");

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/payments?id=${paymentId}`);
      const data = await res.json();
      if (data.status === "confirmed") {
        setStatus("confirmed");
        toast.success("¡Pago confirmado!");
        setTimeout(() => router.push("/analytics"), 5000);
      } else if (data.status === "expired") {
        setStatus("expired");
      }
    } catch {
      // Silently retry
    }
  }, [paymentId, router]);

  // Poll every 30 seconds
  useEffect(() => {
    if (status !== "pending") return;
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [status, checkStatus]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt || status !== "pending") return;
    const interval = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expirado");
        setStatus("expired");
        return;
      }
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${min}:${sec.toString().padStart(2, "0")}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, status]);

  function copy(text: string, field: "address" | "amount") {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  }

  if (status === "confirmed") {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="text-6xl">✅</div>
            <h2 className="text-2xl font-bold text-green-700">¡Pago Confirmado!</h2>
            <p className="text-muted-foreground">
              Tu plan <strong>{planName}</strong> ya está activo.
            </p>
            <p className="text-sm text-muted-foreground">
              Redirigiendo al dashboard en 5 segundos...
            </p>
            <Button onClick={() => router.push("/analytics")} className="bg-green-600 hover:bg-green-700 text-white">
              Ir al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="max-w-md mx-auto mt-12">
        <Card className="border-red-200">
          <CardContent className="pt-8 text-center space-y-4">
            <div className="text-6xl">⏰</div>
            <h2 className="text-2xl font-bold text-red-600">Pago Expirado</h2>
            <p className="text-muted-foreground">
              El tiempo para completar el pago ha expirado.
            </p>
            <Button onClick={() => router.push("/pricing")} variant="outline">
              Volver a Planes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Pago con USDT (BSC)</h1>
        <p className="text-muted-foreground mt-1">
          Enviá exactamente la cantidad indicada a la dirección de abajo
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Plan {planName}</CardTitle>
            <Badge variant="outline" className="animate-pulse">
              {timeLeft || "Calculando..."}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Monto a enviar:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-2xl font-bold text-center">
                {Number(amount).toFixed(2)} USDT
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(Number(amount).toFixed(2), "amount")}
              >
                {copied === "amount" ? "✓" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Dirección de pago (BSC / BEP-20):</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-xs break-all">
                {address}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(address, "address")}
              >
                {copied === "address" ? "✓" : "Copiar"}
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
            <p className="font-semibold text-orange-700">⚠️ Importante:</p>
            <ul className="text-orange-600 text-xs mt-1 space-y-1">
              <li>• Enviá solo USDT por la red BSC (BEP-20)</li>
              <li>• Enviá exactamente {Number(amount).toFixed(2)} USDT</li>
              <li>• No cierres esta página</li>
              <li>• El pago se confirma automáticamente</li>
            </ul>
          </div>

          {/* Status */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />
              Esperando pago...
            </div>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground">
        La verificación es automática. Tu plan se activa al confirmar el pago.
      </p>
    </div>
  );
}
