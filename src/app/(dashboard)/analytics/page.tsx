import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AnalyticsPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          Bienvenido de vuelta, {user.firstName || "usuario"}
        </h1>
        <p className="text-muted-foreground">
          Analiza el rendimiento de tu negocio y el comportamiento de tus
          clientes
        </p>
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
                <p className="text-3xl font-bold">0</p>
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
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Tarjetas activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">2</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Canjeos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">0</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Última actividad de tus clientes</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">
                  Aún no tenemos suficientes datos
                </p>
                <p className="text-sm mt-1">
                  ¡Tranquilo! A medida que tus clientes interactúen, verás aquí
                  métricas increíbles.
                </p>
              </div>
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
