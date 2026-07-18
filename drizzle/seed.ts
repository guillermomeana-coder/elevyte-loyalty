import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding database...");

  // 1. Agency
  const [agency] = await db
    .insert(schema.agencies)
    .values({
      name: "Elevyte Demo",
      appName: "Elevyte Loyalty",
      slug: "elevyte-demo",
      maxLocations: 5,
      plan: "pro",
    })
    .returning();
  console.log(`✅ Agency: ${agency.name} (id: ${agency.id})`);

  // 2. Business
  const [business] = await db
    .insert(schema.businesses)
    .values({
      agencyId: agency.id,
      name: "Demo Restaurant",
      slug: "demo-restaurant",
    })
    .returning();
  console.log(`✅ Business: ${business.name} (id: ${business.id})`);

  // 3. Location
  const [location] = await db
    .insert(schema.locations)
    .values({
      businessId: business.id,
      name: "Demo - Principal",
      address: "Entre Ríos 362",
      city: "San Juan",
      country: "ar",
      latitude: "-31.5375",
      longitude: "-68.5364",
    })
    .returning();
  console.log(`✅ Location: ${location.name} (id: ${location.id})`);

  // 4. Admin user
  const adminPassword = await hash("password123", 12);
  const [admin] = await db
    .insert(schema.users)
    .values({
      email: "admin@elevyte.com",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "Elevyte",
      role: "agency_admin",
      agencyId: agency.id,
    })
    .returning();
  console.log(`✅ Admin: ${admin.email} (id: ${admin.id})`);

  // 5. Worker user
  const workerPassword = await hash("password123", 12);
  const [worker] = await db
    .insert(schema.users)
    .values({
      email: "worker@elevyte.com",
      passwordHash: workerPassword,
      firstName: "Worker",
      lastName: "Demo",
      role: "worker",
      agencyId: agency.id,
      businessId: business.id,
    })
    .returning();
  console.log(`✅ Worker: ${worker.email} (id: ${worker.id})`);

  // 6. Stamp card
  const [stampCard] = await db
    .insert(schema.loyaltyCards)
    .values({
      businessId: business.id,
      type: "stamps",
      name: "Club Demo",
      language: "es",
      status: "active",
      totalStamps: 10,
      completionBehavior: "reset",
      stampIcon: "coffee",
      termsAndConditions:
        "El cliente acepta que los premios pueden cambiar en el futuro\nLos premios están sujetos a disponibilidad\nLa participación en el programa es voluntaria",
      welcomeMessage: "¡Bienvenido a Club Demo! Gracias por unirte a nuestro programa de fidelidad",
      geopushEnabled: true,
      geopushMessage: "¡Estás cerca! Pasá por tu café y sumá puntos en tu tarjeta de fidelidad",
      geopushLatitude: "-31.5375",
      geopushLongitude: "-68.5364",
      geopushRadiusMeters: 200,
    })
    .returning();
  console.log(`✅ Stamp Card: ${stampCard.name} (id: ${stampCard.id})`);

  // 7. Pass design for stamp card
  await db.insert(schema.passDesigns).values({
    cardId: stampCard.id,
    backgroundColor: "#4a7c59",
    foregroundColor: "#ffffff",
    labelColor: "#e0e0e0",
  });
  console.log(`✅ Pass design created for stamp card`);

  // 8. Reward for stamp card
  await db.insert(schema.rewards).values({
    cardId: stampCard.id,
    name: "Café gratis a elección",
    stampsRequired: 10,
  });
  console.log(`✅ Reward: Café gratis a elección`);

  // 9. Registration link for stamp card
  await db.insert(schema.registrationLinks).values({
    cardId: stampCard.id,
    slug: "demo-club",
    name: "Enlace principal",
    clicks: 0,
    registrations: 0,
  });
  console.log(`✅ Registration link: demo-club`);

  // 10. Level card
  const [levelCard] = await db
    .insert(schema.loyaltyCards)
    .values({
      businessId: business.id,
      type: "levels",
      name: "Club Niveles Demo",
      language: "es",
      status: "active",
      currency: "ARS",
      welcomeMessage: "¡Bienvenido al programa de niveles!",
    })
    .returning();
  console.log(`✅ Level Card: ${levelCard.name} (id: ${levelCard.id})`);

  // 11. Pass design for level card
  await db.insert(schema.passDesigns).values({
    cardId: levelCard.id,
    backgroundColor: "#4a7c59",
    foregroundColor: "#ffffff",
    labelColor: "#e0e0e0",
  });

  // 12. Levels
  const levelNames = [
    { name: "Nivel Inicial", minSpend: "0", isInitial: true },
    { name: "Semilla", minSpend: "15000", isInitial: false },
    { name: "Brote", minSpend: "40000", isInitial: false },
    { name: "Raíz", minSpend: "80000", isInitial: false },
    { name: "Fruto", minSpend: "150000", isInitial: false },
  ];
  for (let i = 0; i < levelNames.length; i++) {
    await db.insert(schema.cardLevels).values({
      cardId: levelCard.id,
      name: levelNames[i].name,
      sortOrder: i,
      minSpend: levelNames[i].minSpend,
      isInitial: levelNames[i].isInitial,
    });
  }
  console.log(`✅ 5 levels created for level card`);

  // 13. Club invitation
  await db.insert(schema.clubInvitations).values({
    businessId: business.id,
    cardId: stampCard.id,
    title: "¡Únete a Nuestro Club!",
    description: "Únete a nuestro exclusivo club de beneficios y disfruta de ofertas especiales",
    buttonText: "Unirse ahora",
    isEnabled: true,
  });
  console.log(`✅ Club invitation created`);

  console.log("\n🎉 Seed complete!");
  console.log("   Login: admin@elevyte.com / password123");
  console.log("   Worker: worker@elevyte.com / password123");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
