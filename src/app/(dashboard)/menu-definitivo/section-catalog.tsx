"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createCategory, deleteCategory, createMenuItem, deleteMenuItem } from "@/lib/actions/menus";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
  items: { id: number; name: string; description: string | null; price: string | null }[];
}

export function SectionCatalog({ categories }: { categories: Category[] }) {
  const [newCat, setNewCat] = useState("");
  const [addingItem, setAddingItem] = useState<number | null>(null);

  async function handleCreateCategory() {
    if (!newCat.trim()) return;
    const formData = new FormData();
    formData.set("name", newCat);
    await createCategory(formData);
    setNewCat("");
    toast.success("Categoría creada");
  }

  async function handleDeleteCategory(catId: number) {
    if (!confirm("¿Eliminar categoría y todos sus items?")) return;
    await deleteCategory(catId);
    toast.success("Categoría eliminada");
  }

  async function handleCreateItem(e: React.FormEvent<HTMLFormElement>, catId: number) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("categoryId", String(catId));
    await createMenuItem(formData);
    setAddingItem(null);
    toast.success("Item agregado");
  }

  async function handleDeleteItem(itemId: number) {
    await deleteMenuItem(itemId);
    toast.success("Item eliminado");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Catálogo Web</CardTitle>
        <p className="text-sm text-muted-foreground">
          Gestiona tu catálogo digital interactivo aquí.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="border rounded p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{cat.name}</p>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => setAddingItem(cat.id)}>+</Button>
                <Button variant="outline" size="sm" className="text-red-500" onClick={() => handleDeleteCategory(cat.id)}>✕</Button>
              </div>
            </div>
            {cat.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between pl-4 text-sm">
                <div>
                  <span>{item.name}</span>
                  {item.price && <span className="text-muted-foreground ml-2">${item.price}</span>}
                </div>
                <Button variant="ghost" size="sm" className="text-red-500 h-6" onClick={() => handleDeleteItem(item.id)}>✕</Button>
              </div>
            ))}
            {addingItem === cat.id && (
              <form onSubmit={(e) => handleCreateItem(e, cat.id)} className="pl-4 space-y-2 border-t pt-2">
                <Input name="name" placeholder="Nombre del item" required />
                <div className="grid grid-cols-2 gap-2">
                  <Input name="description" placeholder="Descripción" />
                  <Input name="price" placeholder="Precio" type="number" step="0.01" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">Agregar</Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => setAddingItem(null)}>Cancelar</Button>
                </div>
              </form>
            )}
          </div>
        ))}

        <div className="flex gap-2">
          <Input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="Nueva categoría..."
          />
          <Button onClick={handleCreateCategory} className="bg-orange-500 hover:bg-orange-600 text-white">
            +
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
