"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  slug: string;
  cardName: string;
  cardType: string;
  businessName: string;
}

export function RegistrationForm({ slug, cardName, cardType, businessName }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, firstName, lastName, email, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al registrar");
        return;
      }

      setSuccess(true);
      setWelcomeMessage(data.welcomeMessage || "");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-4">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-bold">¡Bienvenido!</h2>
          {welcomeMessage && (
            <p className="text-muted-foreground">{welcomeMessage}</p>
          )}
          <p className="text-sm text-muted-foreground">
            Ya sos parte de <strong>{cardName}</strong> en {businessName}.
            {cardType === "stamps"
              ? " Empezá a juntar sellos con cada visita."
              : " Empezá a acumular puntos y subí de nivel."}
          </p>
          <div className="pt-4 space-y-2">
            <Button className="w-full bg-black text-white hover:bg-gray-800" disabled>
              🍎 Agregar a Apple Wallet (próximamente)
            </Button>
            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" disabled>
              📱 Agregar a Google Wallet (próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Registrate</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+54 9 ..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
            size="lg"
          >
            {loading ? "Registrando..." : "Unirme al Club"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Al registrarte aceptas los términos y condiciones del programa
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
