import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  cardEnrollments,
  loyaltyCards,
  scans,
  customers,
} from "../../../../drizzle/schema";
import { eq, count, desc, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityChart } from "./activity-chart";

export default async function AnalyticsPage() {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;

  let totalCustomers = 0;
  let totalVisits = 0;
  let totalCards = 0;
  let recentActivity: { name: string; date: Date | null; type: string }[] = [];

  if (businessId) {
    const cards = await db
      .select({ id: loyaltyCards.id })
      .from(loyaltyCards)
      .where(eq(loyaltyCards.businessId, businessId));
    totalCards = cards.length;

    const cardIds = cards.map((c) => c.id);

    if (cardIds.length > 0) {
      for (const cid of cardIds) {
        const [ec] = await db
          .select({ count: count() })
          .from(cardEnrollments)
          .where(eq(cardEnrollments.cardId, cid));
        totalCustomers += ec?.count || 0;

        const [sc] = await db
          .select({ count: count() })
          .from(scans)
          .where(eq(scans.enrollmentId, cid));
        totalVisits += sc?.count || 0;
      }

      // Recent enrollments as activity
      for (const cid of cardIds) {
        const enrollments = await db
          .select({
            firstName: customers.firstName,
            lastName: customers.lastName,
            enrolledAt: cardEnrollments.enrolledAt,
          })
          .from(cardEnrollments)
          .innerJoin(customers, eq(cardEnrollments.customerId, customers.id))
          .where(eq(cardEnrollments.cardId, cid))
          .orderBy(desc(cardEnrollments.enrolledAt))
          .limit(5);

        recentActivity.push(
          ...enrollments.map((e) => ({
            name: `${e.firstName || ""} ${e.lastName || ""}`.trim() || "Cliente",
            date: e.enrolledAt,
            type: "registro",
          }))
        );
      }
    }

    recentActivity.sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    recentActivity = recentActivity.slice(0, 10);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Bienvenido de vuelta, {user.firstName || "usuario"}
          </h1>
          <p className="text-muted-foreground">
            Analiza el rendimiento de tu negocio y el comportamiento de tus
            clientes
          </p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="estampillas">Estampillas</TabsTrigger>
          <TabsTrigger value="niveles">Niveles</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Nuevos clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalCustomers}</p>
                <p className="text-xs text-muted-foreground">
                  Últimos 365 días
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total visitas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalVisits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tarjetas activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalCards}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  ¿Qué día vuelven?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">
                  clientes únicos
                </p>
              </CardContent>
            </Card>
          </div>

          <ActivityChart />

          <Card>
            <CardHeader>
              <CardTitle>Última actividad de tus clientes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">
                    Aún no tenemos suficientes datos
                  </p>
                  <p className="text-sm mt-1">
                    ¡Tranquilo! A medida que tus clientes interactúen, verás
                    aquí métricas increíbles.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-sm font-bold">
                          {activity.name.charAt(0).toUpperCase()}
                        </span>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.type}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {activity.date
                          ? new Date(activity.date).toLocaleDateString("es-AR")
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estampillas" className="mt-4">
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              Métricas de estampillas próximamente
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niveles" className="mt-4">
          <Card>
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              Métricas de niveles próximamente
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
