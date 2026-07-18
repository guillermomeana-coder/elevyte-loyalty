import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses, locations } from "../../../../drizzle/schema";
import { eq, count } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { ClientsTable } from "./clients-table";
import { CreateBusinessDialog } from "./create-business-dialog";

export default async function WhitelabelClientsPage() {
  const user = await requireRole(["agency_admin"]);

  const bizList = await db
    .select({
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      createdAt: businesses.createdAt,
    })
    .from(businesses)
    .where(eq(businesses.agencyId, user.agencyId!));

  const locationCounts: Record<number, number> = {};
  for (const biz of bizList) {
    const [result] = await db
      .select({ count: count() })
      .from(locations)
      .where(eq(locations.businessId, biz.id));
    locationCounts[biz.id] = result?.count || 0;
  }

  const totalLocations = Object.values(locationCounts).reduce((a, b) => a + b, 0);
  const maxLocations = user.agency?.maxLocations || 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mis Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona tus distintos negocios y sus ubicaciones
          </p>
        </div>
        <CreateBusinessDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total de Negocios</p>
            <p className="text-3xl font-bold">{bizList.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total ubicaciones</p>
            <p className="text-3xl font-bold text-orange-500">{totalLocations}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Límite de ubicaciones</p>
            <p className="text-3xl font-bold">
              {totalLocations}/{maxLocations}{" "}
              {totalLocations >= maxLocations && (
                <span className="text-sm text-red-500">(Límite alcanzado)</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <ClientsTable
        businesses={bizList.map((b) => ({
          ...b,
          locationCount: locationCounts[b.id] || 0,
        }))}
      />
    </div>
  );
}
