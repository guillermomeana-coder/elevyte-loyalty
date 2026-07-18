import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, gt } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { db } from "./db";
import { users, sessions, agencies, businesses } from "../../drizzle/schema";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE, type UserRole } from "./constants";

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  return compare(password, passwordHash);
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return sessionId;
}

export async function validateSession(sessionId: string) {
  const result = await db
    .select({
      session: sessions,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.id, sessionId),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (result.length === 0) return null;
  return result[0];
}

export async function deleteSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));

  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return null;

  const result = await validateSession(sessionId);
  if (!result) return null;

  const { user } = result;

  // Load agency
  let agency = null;
  if (user.agencyId) {
    const [a] = await db.select().from(agencies).where(eq(agencies.id, user.agencyId)).limit(1);
    agency = a || null;
  }

  // Load business (for business_admin/worker)
  let business = null;
  if (user.businessId) {
    const [b] = await db.select().from(businesses).where(eq(businesses.id, user.businessId)).limit(1);
    business = b || null;
  }

  // Load all businesses for this agency (for business selector)
  let allBusinesses: typeof businesses.$inferSelect[] = [];
  if (user.agencyId) {
    allBusinesses = await db
      .select()
      .from(businesses)
      .where(eq(businesses.agencyId, user.agencyId));
  }

  return {
    ...user,
    passwordHash: undefined, // Never expose
    agency,
    business,
    allBusinesses,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    redirect("/analytics");
  }
  return user;
}
