import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            EL
          </div>
          <span className="font-bold text-xl">Elevyte Loyalty</span>
        </div>
        <Link href="/login">
          <Button variant="outline">Iniciar sesion</Button>
        </Link>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Fideliza a tus clientes con{" "}
            <span className="text-orange-500">tarjetas digitales</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            Programa de sellos, niveles VIP, Apple y Google Wallet, push
            notifications y QR scanner. Todo en una plataforma.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link href="/login">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8"
              >
                Empezar gratis
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Ver funciones
              </Button>
            </a>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "coffee",
              title: "Tarjetas de Sellos",
              desc: "Tus clientes juntan sellos con cada visita. Al completar, ganan premios. Configurable: 5, 10, 20 sellos.",
            },
            {
              icon: "star",
              title: "Niveles VIP",
              desc: "Crea niveles por gasto acumulado. Cada nivel con sus propias recompensas exclusivas.",
            },
            {
              icon: "phone",
              title: "Apple y Google Wallet",
              desc: "Tus clientes llevan la tarjeta en su celular. Notificaciones automaticas cuando estan cerca del local.",
            },
            {
              icon: "chart",
              title: "Analytics",
              desc: "Dashboard con metricas en tiempo real. Nuevos clientes, retorno, actividad y mas.",
            },
            {
              icon: "bell",
              title: "Push Notifications",
              desc: "Envia promociones directo al celular de tus clientes. Mensajes de bienvenida automaticos.",
            },
            {
              icon: "qr",
              title: "QR Scanner",
              desc: "Escanea desde el celular del worker. Rapido, sin app extra. Rate limiting configurable.",
            },
            {
              icon: "menu",
              title: "Menu Digital",
              desc: "Subi tu menu en PDF o crea un catalogo web interactivo con categorias y precios.",
            },
            {
              icon: "paint",
              title: "Pass Builder",
              desc: "Disena tu tarjeta con editor visual. Colores, logo, imagenes. Preview iOS y Android en vivo.",
            },
            {
              icon: "building",
              title: "Multi-negocio",
              desc: "Gestiona multiples negocios y ubicaciones desde una sola cuenta de agencia.",
            },
          ].map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {f.icon.slice(0, 2).toUpperCase()}
              </div>
              <h3 className="font-semibold text-lg mt-3">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Pricing Preview */}
        <div className="mt-32 text-center">
          <h2 className="text-3xl font-bold">Planes simples, sin sorpresas</h2>
          <p className="text-muted-foreground mt-2">Paga con USDT (BSC)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto">
            {[
              { name: "Starter", price: "15", locations: "1 ubicacion", cards: "2 tarjetas", popular: false },
              { name: "Pro", price: "35", locations: "5 ubicaciones", cards: "10 tarjetas", popular: true },
              { name: "Enterprise", price: "75", locations: "20 ubicaciones", cards: "50 tarjetas", popular: false },
            ].map((plan, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl p-6 border ${
                  plan.popular ? "border-orange-500 border-2 shadow-lg" : "shadow-sm"
                }`}
              >
                {plan.popular && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
                <h3 className="font-bold text-xl mt-2">{plan.name}</h3>
                <p className="text-3xl font-bold mt-2">
                  ${plan.price}
                  <span className="text-sm text-muted-foreground font-normal">
                    {" "}USDT/mes
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-3">{plan.locations}</p>
                <p className="text-sm text-muted-foreground">{plan.cards}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <Link href="/login">
            <Button
              size="lg"
              className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-12"
            >
              Empezar ahora
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>Elevyte Loyalty — Plataforma de fidelizacion digital</p>
      </footer>
    </div>
  );
}
