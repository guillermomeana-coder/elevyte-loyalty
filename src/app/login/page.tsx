"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesion");
        return;
      }

      router.push("/analytics");
    } catch {
      setError("Error de conexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMGg2MHY2MEgweiIgZmlsbD0ibm9uZSIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNnKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center font-bold text-sm">
              EL
            </div>
            <span className="font-semibold text-xl tracking-tight">Elevyte</span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-4xl font-bold leading-tight">
              La plataforma de<br />fidelizacion que tus<br />clientes aman.
            </h2>
            <p className="text-white/70 text-lg max-w-sm">
              Sellos, niveles, wallet passes, push y analytics. Todo en un solo lugar.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {["G", "M", "A", "R"].map((letter, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full bg-white/20 backdrop-blur border-2 border-orange-500 flex items-center justify-center text-xs font-bold"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/60">
                +200 negocios activos
              </p>
            </div>
          </div>

          <p className="text-sm text-white/40">
            Elevyte Loyalty — Fidelizacion digital
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">
                EL
              </div>
              <span className="font-semibold text-lg text-white tracking-tight">Elevyte</span>
            </Link>
          </div>

          <div className="space-y-2 mb-8">
            <h1 className="text-2xl font-bold text-white tracking-tight">Bienvenido</h1>
            <p className="text-white/40 text-sm">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/60 text-sm">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-lg focus:border-orange-500 focus:ring-orange-500/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/60 text-sm">
                Contrasena
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 h-11 rounded-lg focus:border-orange-500 focus:ring-orange-500/20"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white h-11 rounded-lg font-medium shadow-lg shadow-orange-500/20"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Iniciando...
                </span>
              ) : (
                "Iniciar sesion"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-center text-sm text-white/30">
              No tenes cuenta?{" "}
              <Link href="/" className="text-orange-400 hover:text-orange-300">
                Ver planes
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
