import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

async function seedPlans() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  console.log("🌱 Seeding subscription plans...");

  const plans = [
    {
      name: "Starter",
      slug: "starter",
      priceUsdt: "15",
      maxLocations: 1,
      maxCards: 2,
      features: ["1 ubicación", "2 tarjetas", "QR Scanner", "Push notifications"],
      sortOrder: 0,
    },
    {
      name: "Pro",
      slug: "pro",
      priceUsdt: "35",
      maxLocations: 5,
      maxCards: 10,
      features: ["5 ubicaciones", "10 tarjetas", "QR Scanner", "Push notifications", "Menú digital", "Apple & Google Wallet"],
      sortOrder: 1,
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      priceUsdt: "75",
      maxLocations: 20,
      maxCards: 50,
      features: ["20 ubicaciones", "50 tarjetas", "Todo incluido", "Soporte prioritario", "Whitelabel completo"],
      sortOrder: 2,
    },
  ];

  for (const plan of plans) {
    await db.insert(schema.subscriptionPlans).values(plan);
    console.log(`✅ Plan: ${plan.name} — $${plan.priceUsdt} USDT/mes`);
  }

  console.log("\n🎉 Plans seeded!");
}

seedPlans().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
