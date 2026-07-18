# Elevyte Loyalty — Arquitectura

## Stack
- **Framework:** Next.js 16 App Router + TypeScript
- **DB:** PostgreSQL en Neon (serverless) + Drizzle ORM
- **UI:** shadcn/ui (base-nova) + Tailwind CSS v4
- **Auth:** Custom sessions (bcryptjs + httpOnly cookies)
- **Storage:** Vercel Blob
- **Deploy:** Vercel

## Estructura de rutas

### Dashboard (autenticado)
```
/analytics              — Métricas (General/Estampillas/Niveles)
/my-whitelabel          — Config agencia (nombre, logo)
/whitelabel-clients     — Lista negocios
/manage-whitelabel-client/[id] — Gestionar negocio (admins, ubicaciones)
/fidelidad              — Grid tarjetas de lealtad
/fidelidad/[id]         — Detalle tarjeta (7 tabs)
/menu-definitivo        — Menús (PDF, web, club invitation)
/pass-builder/[id]      — Editor visual de tarjeta
/scan                   — Scanner QR para workers
```

### Público (sin auth)
```
/login                  — Login
/register/[slug]        — Registro cliente
/menu/[businessSlug]    — Menú público
```

### API
```
/api/auth/login         — POST login
/api/auth/logout        — POST logout
/api/auth/me            — GET usuario actual
/api/auth/create-user   — POST crear usuario
/api/upload             — POST subir archivo (Vercel Blob)
/api/scan               — POST escanear QR
/api/register           — POST registrar cliente
/api/analytics/*        — GET métricas
/api/wallet/apple/*     — Apple Wallet web service
/api/wallet/google/*    — Google Wallet callback
```

## Base de datos (21 tablas)

### Core multi-tenant
- `agencies` — Agencia (top level)
- `businesses` — Negocios (bajo una agencia)
- `locations` — Ubicaciones físicas

### Auth
- `users` — Usuarios (agency_admin / business_admin / worker)
- `sessions` — Sesiones activas

### Loyalty
- `loyalty_cards` — Tarjetas (stamps o levels)
- `pass_designs` — Diseño visual del pass
- `card_levels` — Niveles (solo para tipo levels)
- `rewards` — Recompensas
- `customers` — Clientes finales
- `card_enrollments` — Inscripciones cliente-tarjeta
- `scans` — Escaneos/visitas
- `redemptions` — Canjeos

### Engagement
- `push_messages` — Mensajes push
- `push_deliveries` — Entregas por cliente
- `registration_links` — Links de registro con métricas

### Content
- `menus_pdf` — PDFs de menú
- `menu_categories` — Categorías menú web
- `menu_items` — Items del menú
- `club_invitations` — Popup invitación al club

## Archivos clave
```
drizzle/schema.ts           — Schema completo DB
drizzle/seed.ts             — Datos demo
src/lib/auth.ts             — Auth (hash, sessions, requireAuth)
src/lib/db.ts               — Conexión Drizzle + Neon
src/lib/constants.ts        — Constantes (roles, cookies, idiomas)
src/lib/actions/*.ts        — Server actions por dominio
src/components/app-sidebar.tsx  — Sidebar navegación
src/components/app-header.tsx   — Header con selector negocio
src/middleware.ts           — Protección de rutas
```

## Progreso

| Fase | Estado | Descripción |
|---|---|---|
| F0 Foundation | ✅ DONE | DB, auth, layout, middleware |
| F1 Agencia/Negocios | ✅ DONE | CRUD agencia, negocios, ubicaciones, admins |
| F2 Tarjetas Core | ✅ DONE | CRUD tarjetas, rewards, niveles, 7 tabs |
| F3 Analytics | ✅ DONE | Dashboard con Recharts, activity feed, stats reales |
| F4 QR Scanning | ✅ DONE | Scanner cámara jsQR, sellos, rate limiting, API scan |
| F5 Wallet | ✅ DONE* | Apple Wallet passkit-generator + Google Wallet JWT (*necesita certs para producción) |
| F6 Rutas Públicas | ✅ DONE | Registro /register/[slug], menú público /menu/[slug] |
| F7 Menús | ✅ DONE | PDF upload, catálogo web, club invitation |
| F8 Pass Builder | ✅ DONE | Editor visual react-colorful, preview iOS/Android live |
| F9 Push + Email | ✅ DONE | Push create/send, Resend welcome email, graceful degradation |
| F10 Billing | ⬜ PENDIENTE | Stripe suscripciones, i18n |

## Credenciales demo
- Admin: admin@elevyte.com / password123
- Worker: worker@elevyte.com / password123
