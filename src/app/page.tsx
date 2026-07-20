import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    ),
    title: "Tarjetas de Sellos",
    desc: "Junta sellos con cada visita. Configura premios al completar 5, 10 o 20 sellos.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: "Niveles VIP",
    desc: "Niveles por gasto acumulado con recompensas exclusivas en cada tier.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    ),
    title: "Apple & Google Wallet",
    desc: "Pass nativo en el celular. Geopush automatico al pasar cerca del local.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      </svg>
    ),
    title: "QR Scanner",
    desc: "Escanea desde cualquier celular. Sin app. Rate limiting por cliente.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
    ),
    title: "Push Notifications",
    desc: "Promociones directo al wallet. Bienvenida automatica al registrarse.",
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
    title: "Analytics",
    desc: "Metricas en tiempo real. Clientes, retorno, actividad, conversiones.",
  },
];

const plans = [
  { name: "Starter", price: 15, locations: 1, cards: 2, highlight: false },
  { name: "Pro", price: 35, locations: 5, cards: 10, highlight: true },
  { name: "Enterprise", price: 75, locations: 20, cards: 50, highlight: false },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs tracking-tight">
              EL
            </div>
            <span className="font-semibold text-lg tracking-tight">Elevyte</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Login
              </Button>
            </Link>
            <Link href="/login">
              <Button className="bg-white text-black hover:bg-white/90 rounded-full px-5 text-sm font-medium">
                Empezar gratis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/60 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Plataforma en vivo
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Fideliza clientes.
            <br />
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Multiplica ventas.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
            Tarjetas de sellos, niveles VIP, Apple & Google Wallet, push notifications
            y QR scanner. Todo lo que necesitas para que tus clientes vuelvan.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-orange-500/25">
                Crear cuenta gratis
              </Button>
            </Link>
            <a href="#features">
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-white/5 rounded-full px-8 h-12 text-base">
                Ver funciones
              </Button>
            </a>
          </div>
        </div>

        {/* Fake dashboard preview */}
        <div className="max-w-5xl mx-auto mt-20">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-1 shadow-2xl">
            <div className="rounded-xl bg-gradient-to-b from-[#111] to-[#0d0d0d] p-6 md:p-10">
              <div className="flex items-center gap-2 mb-6">
                <span className="h-3 w-3 rounded-full bg-red-500/70" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                <span className="h-3 w-3 rounded-full bg-green-500/70" />
                <span className="ml-4 text-xs text-white/30 font-mono">app.elevyte.com/analytics</span>
              </div>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Clientes", value: "1,247" },
                  { label: "Visitas hoy", value: "89" },
                  { label: "Sellos canjeados", value: "342" },
                  { label: "Conversion", value: "34.2%" },
                ].map((s, i) => (
                  <div key={i} className="bg-white/[0.03] rounded-lg p-4 border border-white/5">
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-bold mt-1 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{s.value}</p>
                  </div>
                ))}
              </div>
              <div className="h-32 bg-white/[0.02] rounded-lg border border-white/5 flex items-end px-4 pb-4 gap-1">
                {[40, 65, 45, 80, 60, 90, 70, 55, 85, 95, 75, 88, 60, 72, 80, 92, 68, 78, 85, 70].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-orange-500/60 to-orange-400/20"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3">Funcionalidades</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Todo para fidelizar</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-lg mt-4 text-white/90">{f.title}</h3>
                <p className="text-sm text-white/40 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3">Precios</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Simple y transparente</h2>
            <p className="text-white/40 mt-3">Paga con USDT en la red BSC. Sin tarjeta de credito.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`rounded-2xl p-6 border transition-all ${
                  plan.highlight
                    ? "border-orange-500/50 bg-gradient-to-b from-orange-500/10 to-transparent shadow-lg shadow-orange-500/5"
                    : "border-white/5 bg-white/[0.02] hover:border-white/10"
                }`}
              >
                {plan.highlight && (
                  <span className="inline-block text-[11px] font-medium bg-orange-500 text-white px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                    Mas popular
                  </span>
                )}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-white/40 text-sm">USDT/mes</span>
                </div>
                <div className="mt-6 space-y-3">
                  {[
                    `${plan.locations} ubicacion${plan.locations > 1 ? "es" : ""}`,
                    `${plan.cards} tarjetas de lealtad`,
                    "QR Scanner",
                    "Push notifications",
                    "Apple & Google Wallet",
                    ...(plan.locations >= 5 ? ["Menu digital"] : []),
                    ...(plan.locations >= 20 ? ["Soporte prioritario", "Whitelabel"] : []),
                  ].map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5 text-sm">
                      <svg className="h-4 w-4 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-white/60">{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/login" className="block mt-8">
                  <Button
                    className={`w-full rounded-full h-11 font-medium ${
                      plan.highlight
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                    }`}
                  >
                    Empezar
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Listo para fidelizar?
          </h2>
          <p className="text-white/40 mt-4 text-lg">
            Crea tu cuenta en segundos. Sin tarjeta de credito.
          </p>
          <Link href="/login" className="inline-block mt-8">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-10 h-12 text-base font-medium shadow-lg shadow-orange-500/25">
              Empezar ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold text-[9px]">
              EL
            </div>
            <span className="text-sm text-white/40">Elevyte Loyalty</span>
          </div>
          <p className="text-sm text-white/30">Plataforma de fidelizacion digital</p>
        </div>
      </footer>
    </div>
  );
}
