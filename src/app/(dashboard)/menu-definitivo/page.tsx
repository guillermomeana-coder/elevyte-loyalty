import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  menusPdf,
  menuCategories,
  menuItems,
  clubInvitations,
} from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SectionPdf } from "./section-pdf";
import { SectionCatalog } from "./section-catalog";
import { SectionClub } from "./section-club";

export default async function MenuDefinitivoPage() {
  const user = await requireAuth();
  const businessId = user.business?.id || user.allBusinesses[0]?.id;

  let pdfs: { id: number; fileUrl: string; fileName: string | null }[] = [];
  let categories: {
    id: number;
    name: string;
    items: { id: number; name: string; description: string | null; price: string | null }[];
  }[] = [];
  let clubInvite: {
    title: string | null;
    description: string | null;
    buttonText: string | null;
    isEnabled: boolean | null;
  } | null = null;

  if (businessId) {
    pdfs = await db
      .select({ id: menusPdf.id, fileUrl: menusPdf.fileUrl, fileName: menusPdf.fileName })
      .from(menusPdf)
      .where(eq(menusPdf.businessId, businessId));

    const cats = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.businessId, businessId));

    categories = await Promise.all(
      cats.map(async (cat) => {
        const items = await db
          .select({
            id: menuItems.id,
            name: menuItems.name,
            description: menuItems.description,
            price: menuItems.price,
          })
          .from(menuItems)
          .where(eq(menuItems.categoryId, cat.id));
        return { id: cat.id, name: cat.name, items };
      })
    );

    const [ci] = await db
      .select()
      .from(clubInvitations)
      .where(eq(clubInvitations.businessId, businessId))
      .limit(1);
    clubInvite = ci || null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menús</h1>
        <p className="text-muted-foreground">
          Gestiona tus menús y pedidos
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SectionPdf pdfs={pdfs} />
        <SectionCatalog categories={categories} />
        <SectionClub invitation={clubInvite} />
      </div>
    </div>
  );
}
