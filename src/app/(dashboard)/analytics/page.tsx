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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Hola, {user.firstName || "usuario"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen de tu negocio
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="estampillas">Estampillas</TabsTrigger>
          <TabsTrigger value="niveles">Niveles</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Clientes</p>
                  <div className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2">{totalCustomers}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Ultimos 365 dias</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Visitas</p>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2">{totalVisits}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tarjetas</p>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2">{totalCards}</p>
                <p className="text-[11px] text-muted-foreground mt-1">Activas</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Retorno</p>
                  <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                  </div>
                </div>
                <p className="text-3xl font-bold mt-2">0</p>
                <p className="text-[11px] text-muted-foreground mt-1">Clientes que vuelven</p>
              </CardContent>
            </Card>
          </div>

          <ActivityChart />

          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Actividad reciente</CardTitle>
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
