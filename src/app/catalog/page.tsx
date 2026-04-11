import { Suspense } from "react";
import { getProducts, getPriceRange } from "@/lib/services/product.service";
import { getCategories } from "@/lib/services/category.service";
import {
  ProductGrid,
  ProductGridSkeleton,
  FilterSidebar,
  Pagination,
  NoResults,
} from "@/components/catalog";
import { Header, Footer } from "@/components/layout";

// Skeleton for FilterSidebar
function FilterSidebarSkeleton() {
  return (
    <aside className="hidden lg:block w-64 flex-shrink-0">
      <div className="bg-card rounded-lg p-6 border border-border">
        <div className="space-y-6">
          <div className="h-6 bg-muted rounded w-20 animate-skeleton" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-24 animate-skeleton" />
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-10 bg-muted rounded animate-skeleton" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-20 animate-skeleton" />
            <div className="flex gap-2">
              <div className="h-10 bg-muted rounded flex-1 animate-skeleton" />
              <div className="h-10 bg-muted rounded flex-1 animate-skeleton" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Skeleton for Pagination
function PaginationSkeleton() {
  return (
    <div className="flex items-center justify-between pt-6 border-t border-border">
      <div className="h-5 bg-muted rounded w-40 animate-skeleton" />
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-9 bg-muted rounded animate-skeleton" />
        ))}
      </div>
    </div>
  );
}

interface CatalogPageProps {
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  }>;
}

export const metadata = {
  title: "Shop Collection",
  description: "Browse our beautiful collection of girls' clothing available for virtual try-on.",
};

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  // Parse search params
  const categoryId = params.category;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const search = params.search;
  const page = params.page ? parseInt(params.page, 10) : 1;

  // Fetch data in parallel
  const [productsResult, categories, priceRange] = await Promise.all([
    getProducts({ categoryId, minPrice, maxPrice, search, page }),
    getCategories(),
    getPriceRange(),
  ]);

  const hasActiveFilters = !!(categoryId || minPrice || maxPrice || search);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 bg-background">
        {/* Header */}
        <div className="bg-muted border-b border-border">
          <div className="container-fashion py-12 lg:py-16">
            <p className="label-elegant text-primary mb-3">Shop</p>
            <h1 className="text-3xl lg:text-4xl font-medium text-foreground">
              {search ? `Search: "${search}"` : "Our Collection"}
            </h1>
            <div className="divider-elegant mt-4" />
            <p className="mt-4 text-muted-foreground max-w-xl">
              {search
                ? `Showing results for "${search}"`
                : "Discover beautiful clothing for girls. Browse our curated collection and find your perfect look."}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="container-fashion py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters */}
            <Suspense fallback={<FilterSidebarSkeleton />}>
              <FilterSidebar
                categories={categories}
                priceRange={priceRange}
                selectedCategoryId={categoryId}
                currentMinPrice={minPrice}
                currentMaxPrice={maxPrice}
                hasActiveFilters={hasActiveFilters}
              />
            </Suspense>

            {/* Product Grid */}
            <div className="flex-1">
              {productsResult.products.length > 0 ? (
                <>
                  <Suspense fallback={<ProductGridSkeleton />}>
                    <ProductGrid products={productsResult.products} />
                  </Suspense>

                  {/* Pagination */}
                  <Suspense fallback={<PaginationSkeleton />}>
                    <Pagination
                      currentPage={productsResult.page}
                      totalPages={productsResult.totalPages}
                      total={productsResult.total}
                    />
                  </Suspense>
                </>
              ) : (
                <NoResults hasFilters={hasActiveFilters} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
