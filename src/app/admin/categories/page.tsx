import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { CategoryListClient } from "./CategoryListClient";
import { getAdminCategories } from "@/lib/services/admin/category.admin.service";

export default async function CategoriesPage() {
  const categories = await getAdminCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Organize your product catalog
          </p>
        </div>
        <Link href="/admin/categories/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </Link>
      </div>

      {/* Category List */}
      <CategoryListClient categories={categories} />
    </div>
  );
}
