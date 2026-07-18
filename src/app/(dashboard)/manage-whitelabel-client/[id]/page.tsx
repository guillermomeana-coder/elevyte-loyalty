import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, locations, users } from "../../../../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LocationsSection } from "./locations-section";
import { AdminsSection } from "./admins-section";

export default async function ManageClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole(["agency_admin"]);
  const { id } = await params;
  const businessId = Number(id);

  const [business] = await db
    .select()
    .from(businesses)
    .where(
      and(eq(businesses.id, businessId), eq(businesses.agencyId, user.agencyId!))
    )
    .limit(1);

  if (!business) notFound();

  const locationsList = await db
    .select()
    .from(locations)
    .where(eq(locations.businessId, businessId));

  const adminsList = await db
    .select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
    })
    .from(users)
    .where(eq(users.businessId, businessId));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          href="/whitelabel-clients"
          className="text-orange-500 hover:underline"
        >
          ← Volver
        </Link>
      </div>

      <Card>
        <CardContent className="pt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {business.logoUrl ? (
              <img
                src={business.logoUrl}
                alt={business.name}
                className="h-12 w-12 rounded-md object-cover"
              />
            ) : (
              <div className="h-12 w-12 rounded-md bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {business.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold">{business.name}</h1>
              <p className="text-sm text-muted-foreground">
                Gestionando como parte de la agencia {user.agency?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              Ubicaciones: {locationsList.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <AdminsSection admins={adminsList} businessId={businessId} agencyId={user.agencyId!} />

      <LocationsSection locations={locationsList} businessId={businessId} />
    </div>
  );
}
