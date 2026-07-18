import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  loyaltyCards,
  rewards,
  cardLevels,
  cardEnrollments,
  customers,
  pushMessages,
  registrationLinks,
  redemptions,
} from "../../../../../drizzle/schema";
import { eq, count, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TabResumen } from "./tab-resumen";
import { TabConfiguration } from "./tab-configuration";
import { TabRewards } from "./tab-rewards";
import { TabLevels } from "./tab-levels";
import { TabDanger } from "./tab-danger";
import { TabPushMessages } from "./tab-push-messages";
import { TabClients } from "./tab-clients";

export default async function CardDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  await requireAuth();
  const { id } = await params;
  const { tab } = await searchParams;
  const cardId = Number(id);

  const [card] = await db
    .select()
    .from(loyaltyCards)
    .where(eq(loyaltyCards.id, cardId))
    .limit(1);

  if (!card) notFound();

  const rewardsList = await db
    .select()
    .from(rewards)
    .where(eq(rewards.cardId, cardId));

  const levelsList = await db
    .select()
    .from(cardLevels)
    .where(eq(cardLevels.cardId, cardId))
    .orderBy(cardLevels.sortOrder);

  const [enrollmentCount] = await db
    .select({ count: count() })
    .from(cardEnrollments)
    .where(eq(cardEnrollments.cardId, cardId));

  const enrollments = await db
    .select({
      id: cardEnrollments.id,
      currentStamps: cardEnrollments.currentStamps,
      totalSpend: cardEnrollments.totalSpend,
      totalVisits: cardEnrollments.totalVisits,
      lastVisitAt: cardEnrollments.lastVisitAt,
      enrolledAt: cardEnrollments.enrolledAt,
      customerFirstName: customers.firstName,
      customerLastName: customers.lastName,
      customerEmail: customers.email,
      customerPhone: customers.phone,
    })
    .from(cardEnrollments)
    .innerJoin(customers, eq(cardEnrollments.customerId, customers.id))
    .where(eq(cardEnrollments.cardId, cardId))
    .orderBy(desc(cardEnrollments.enrolledAt))
    .limit(20);

  const pushList = await db
    .select()
    .from(pushMessages)
    .where(eq(pushMessages.cardId, cardId))
    .orderBy(desc(pushMessages.createdAt));

  const links = await db
    .select()
    .from(registrationLinks)
    .where(eq(registrationLinks.cardId, cardId));

  const currentTab = tab || "resumen";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/fidelidad" className="text-orange-500 hover:underline">
          ← Volver
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{card.name}</h1>
          <p className="text-muted-foreground">
            Administra la configuración y detalles de tu programa de fidelidad
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={card.status === "active" ? "default" : "secondary"}
            className={card.status === "active" ? "bg-green-500" : ""}
          >
            {card.status === "active" ? "Activa" : "Inactiva"}
          </Badge>
          <Badge variant="outline">
            {card.type === "stamps" ? "Estampillas" : "Niveles"}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue={currentTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="configuration">Configuración</TabsTrigger>
          <TabsTrigger value="clients">Ver Clientes</TabsTrigger>
          <TabsTrigger value="pushMessages">Mensajes Push</TabsTrigger>
          <TabsTrigger value="rewards">Recompensas</TabsTrigger>
          {card.type === "levels" && (
            <TabsTrigger value="levels">Niveles</TabsTrigger>
          )}
          <TabsTrigger value="danger">Zona de peligro</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen">
          <TabResumen
            card={card}
            enrollmentCount={enrollmentCount?.count || 0}
            enrollments={enrollments}
            links={links}
          />
        </TabsContent>

        <TabsContent value="configuration">
          <TabConfiguration card={card} />
        </TabsContent>

        <TabsContent value="clients">
          <TabClients enrollments={enrollments} cardType={card.type} />
        </TabsContent>

        <TabsContent value="pushMessages">
          <TabPushMessages messages={pushList} cardId={cardId} />
        </TabsContent>

        <TabsContent value="rewards">
          <TabRewards
            rewards={rewardsList}
            cardId={cardId}
            cardType={card.type}
            levels={levelsList}
          />
        </TabsContent>

        {card.type === "levels" && (
          <TabsContent value="levels">
            <TabLevels levels={levelsList} cardId={cardId} />
          </TabsContent>
        )}

        <TabsContent value="danger">
          <TabDanger cardId={cardId} cardName={card.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
