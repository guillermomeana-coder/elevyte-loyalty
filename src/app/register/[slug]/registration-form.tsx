"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 p-8 text-center space-y-5">
        <div className="h-16 w-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
          <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">Bienvenido!</h2>
        {welcomeMessage && (
          <p className="text-white/50 text-sm">{welcomeMessage}</p>
        )}
        <p className="text-sm text-white/40">
          Ya sos parte de <span className="text-orange-400 font-medium">{cardName}</span> en {businessName}.
          {cardType === "stamps"
            ? " Empeza a juntar sellos con cada visita."
            : " Empeza a acumular puntos y subi de nivel."}
        </p>
        <div className="pt-2 space-y-2.5">
          <Button className="w-full bg-black text-white hover:bg-gray-900 border border-white/10 h-11 rounded-xl" disabled>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            Apple Wallet (proximamente)
          </Button>
          <Button className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10 h-11 rounded-xl" disabled>
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.64.71.64 1.19s-.3.92-.64 1.19L17.69 15l-2.56-2.56L17.69 10l2.47 1.81zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/></svg>
            Google Wallet (proximamente)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/10 p-6 md:p-8">
      <h2 className="text-lg font-semibold text-white text-center mb-6">Registrate</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="firstName" className="text-white/50 text-xs">Nombre *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl focus:border-orange-500 focus:ring-orange-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="lastName" className="text-white/50 text-xs">Apellido</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl focus:border-orange-500 focus:ring-orange-500/20"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/50 text-xs">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-white/50 text-xs">Telefono</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+54 9 ..."
            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-xl focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-11 rounded-xl font-medium shadow-lg shadow-orange-500/20"
          size="lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Registrando...
            </span>
          ) : (
            "Unirme al Club"
          )}
        </Button>

        <p className="text-[11px] text-center text-white/20">
          Al registrarte aceptas los terminos y condiciones del programa
        </p>
      </form>
    </div>
  );
}
