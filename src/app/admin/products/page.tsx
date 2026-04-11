import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { ProductListClient } from "./ProductListClient";
import { getAdminProducts } from "@/lib/services/admin/product.admin.service";
import { getCategories } from "@/lib/services/category.service";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const categoryId = params.category || "";
  const page = parseInt(params.page || "1", 10);

  const [productsResult, categories] = await Promise.all([
    getAdminProducts({
      search,
      categoryId: categoryId || undefined,
      page,
      limit: 20,
    }),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your product catalog
          </p>
        </div>
        <Link href="/admin/products/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </Link>
      </div>

      {/* Product List */}
      <ProductListClient
        products={productsResult.products}
        categories={categories}
        total={productsResult.total}
        page={productsResult.page}
        totalPages={productsResult.totalPages}
        search={search}
        categoryFilter={categoryId}
      />
    </div>
  );
}
