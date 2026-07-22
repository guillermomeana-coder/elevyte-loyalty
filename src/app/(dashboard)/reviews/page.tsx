import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { businesses } from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ReviewSettings } from "./review-settings";

export default async function ReviewsPage() {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;

  let business = null;
  if (businessId) {
    const [biz] = await db
      .select()
      .from(businesses)
      .where(eq(businesses.id, businessId))
      .limit(1);
    business = biz || null;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resenas</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Conecta Google Business y automatiza pedidos de resenas
        </p>
      </div>

      <ReviewSettings
        googlePlaceId={business?.googlePlaceId || ""}
        googleReviewUrl={business?.googleReviewUrl || ""}
        reviewRequestEnabled={business?.reviewRequestEnabled || false}
        reviewRequestAfterVisits={business?.reviewRequestAfterVisits || 3}
        reviewRequestMessage={business?.reviewRequestMessage || ""}
        businessName={business?.name || ""}
      />
    </div>
  );
}
