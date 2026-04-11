import Link from "next/link";
import { Package, FolderTree, Plus, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui";

async function getDashboardStats() {
  const supabase = await createClient();

  const [productsResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("categories").select("id", { count: "exact", head: true }),
  ]);

  return {
    productCount: productsResult.count ?? 0,
    categoryCount: categoriesResult.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage your products and categories
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Products Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.productCount}
              </p>
              <p className="text-sm text-muted-foreground">Total Products</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <Link
              href="/admin/products"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/admin/products/new">
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </Link>
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {stats.categoryCount}
              </p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <Link
              href="/admin/categories"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/admin/categories/new">
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/products/new">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
          </Link>
          <Link href="/admin/categories/new">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Plus className="w-4 h-4" />
              Add New Category
            </Button>
          </Link>
          <Link href="/admin/products">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Package className="w-4 h-4" />
              Manage Products
            </Button>
          </Link>
          <Link href="/admin/categories">
            <Button variant="outline" className="w-full justify-start gap-2">
              <FolderTree className="w-4 h-4" />
              Manage Categories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
