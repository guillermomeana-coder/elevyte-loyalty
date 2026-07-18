"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsQR from "jsqr";

interface ScanResult {
  customer: { name: string };
  enrollment: {
    currentStamps: number;
    totalStamps: number;
    totalSpend: string;
    totalVisits: number;
  };
}

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [manualId, setManualId] = useState("");
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const scanningRef = useRef(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setScanning(true);
        scanningRef.current = true;
        scanLoop();
      }
    } catch {
      setCameraError("No se pudo acceder a la cámara");
    }
  }, []);

  function stopCamera() {
    scanningRef.current = false;
    setScanning(false);
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
  }

  function scanLoop() {
    if (!scanningRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      requestAnimationFrame(scanLoop);
      return;
    }

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      handleQRData(code.data);
      return;
    }

    requestAnimationFrame(scanLoop);
  }

  async function handleQRData(data: string) {
    stopCamera();
    // Expected format: enrollmentId or URL containing enrollmentId
    let enrollmentId: number;
    const match = data.match(/enrollment[\/=](\d+)/i) || data.match(/^(\d+)$/);
    if (match) {
      enrollmentId = Number(match[1]);
    } else {
      toast.error("QR no reconocido");
      return;
    }
    await processScan(enrollmentId);
  }

  async function handleManualScan() {
    if (!manualId) return;
    await processScan(Number(manualId));
  }

  async function processScan(enrollmentId: number) {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId,
          scanType: "stamp",
          stampsAdded: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Error al escanear");
        return;
      }

      setResult(data);
      toast.success(`¡Sello agregado para ${data.customer.name}!`);
    } catch {
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Escanear QR</h1>
        <p className="text-muted-foreground">
          Escanea el código QR del cliente para agregar sellos
        </p>
      </div>

      {/* Camera */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            {!scanning && !result && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  onClick={startCamera}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  size="lg"
                >
                  📷 Activar Cámara
                </Button>
              </div>
            )}
            {scanning && (
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <Badge className="bg-green-500 animate-pulse">
                  Escaneando...
                </Badge>
              </div>
            )}
          </div>
          {scanning && (
            <Button
              onClick={stopCamera}
              variant="outline"
              className="w-full mt-3"
            >
              Detener cámara
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Manual entry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Ingreso manual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
              placeholder="ID de enrollment"
              type="number"
            />
            <Button
              onClick={handleManualScan}
              disabled={loading || !manualId}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {loading ? "..." : "Escanear"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result */}
      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="text-4xl">✅</div>
            <h3 className="text-xl font-bold">{result.customer.name}</h3>
            <div className="flex justify-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">Sellos</p>
                <p className="text-2xl font-bold">
                  {result.enrollment.currentStamps}/{result.enrollment.totalStamps}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Visitas</p>
                <p className="text-2xl font-bold">
                  {result.enrollment.totalVisits}
                </p>
              </div>
            </div>
            <Button
              onClick={() => {
                setResult(null);
                startCamera();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Escanear otro
            </Button>
          </CardContent>
        </Card>
      )}

      {cameraError && (
        <p className="text-center text-red-500 text-sm">{cameraError}</p>
      )}
    </div>
  );
}
