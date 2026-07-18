import { db } from "@/lib/db";
import {
  businesses,
  menusPdf,
  menuCategories,
  menuItems,
  clubInvitations,
} from "../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClubPopup } from "./club-popup";

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ businessSlug: string }>;
}) {
  const { businessSlug } = await params;

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, businessSlug))
    .limit(1);

  if (!business) notFound();

  const pdfs = await db
    .select()
    .from(menusPdf)
    .where(eq(menusPdf.businessId, business.id));

  const cats = await db
    .select()
    .from(menuCategories)
    .where(eq(menuCategories.businessId, business.id));

  const categoriesWithItems = await Promise.all(
    cats.map(async (cat) => {
      const items = await db
        .select()
        .from(menuItems)
        .where(eq(menuItems.categoryId, cat.id));
      return { ...cat, items };
    })
  );

  const [clubInvite] = await db
    .select()
    .from(clubInvitations)
    .where(eq(clubInvitations.businessId, business.id))
    .limit(1);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4 px-6 flex items-center gap-3">
        {business.logoUrl && (
          <img
            src={business.logoUrl}
            alt={business.name}
            className="h-10 w-10 rounded-lg object-cover"
          />
        )}
        <h1 className="text-xl font-bold">{business.name}</h1>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="menu">
          <TabsList>
            {pdfs.length > 0 && <TabsTrigger value="pdf">PDF</TabsTrigger>}
            {categoriesWithItems.length > 0 && (
              <TabsTrigger value="menu">Menú</TabsTrigger>
            )}
          </TabsList>

          {pdfs.length > 0 && (
            <TabsContent value="pdf" className="space-y-4 mt-4">
              {pdfs.map((pdf) => (
                <Card key={pdf.id}>
                  <CardContent className="pt-6">
                    <a
                      href={pdf.fileUrl}
                      target="_blank"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      📄 {pdf.fileName || "Ver Menú"}
                    </a>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          )}

          <TabsContent value="menu" className="space-y-6 mt-4">
            {categoriesWithItems.map((cat) => (
              <Card key={cat.id}>
                <CardHeader>
                  <CardTitle>{cat.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-medium">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                        {item.price && (
                          <p className="font-semibold">
                            ${Number(item.price).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                    {cat.items.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        Sin items en esta categoría
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {categoriesWithItems.length === 0 && pdfs.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Menú no disponible
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {clubInvite && clubInvite.isEnabled && (
        <ClubPopup
          title={clubInvite.title || ""}
          description={clubInvite.description || ""}
          buttonText={clubInvite.buttonText || "Unirse"}
          businessSlug={businessSlug}
        />
      )}
    </div>
  );
}
