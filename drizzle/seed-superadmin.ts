import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import * as schema from "./schema";

async function run() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  const pw = await hash("Valarmorghulis1!", 12);
  const [user] = await db
    .insert(schema.users)
    .values({
      email: "guillermomeana@ulp.edu.ar",
      passwordHash: pw,
      firstName: "Guillermo",
      lastName: "Von Papendieck",
      role: "agency_admin",
      agencyId: 1,
    })
    .returning();

  console.log("✅ Super admin created:", user.email, "id:", user.id);
}

run().catch((e) => console.error("❌", e));
