"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Button } from "@/components/ui";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { formatCurrency, cn } from "@/lib/utils";
import type { Category } from "@/types";

interface AdminProductWithCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image_url: string;
  is_active: boolean | null;
  category_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  categories: Category | null;
}

interface ProductListProps {
  products: AdminProductWithCategory[];
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
  onSearch: (search: string) => void;
  onFilterCategory: (categoryId: string) => void;
  onPageChange: (page: number) => void;
  onDelete: (productId: string) => Promise<void>;
  search?: string;
  categoryFilter?: string;
}

export function ProductList({
  products,
  categories,
  total,
  page,
  totalPages,
  onSearch,
  onFilterCategory,
  onPageChange,
  onDelete,
  search = "",
  categoryFilter = "",
}: ProductListProps) {
  const [searchInput, setSearchInput] = useState(search);
  const [deleteProduct, setDeleteProduct] = useState<AdminProductWithCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const handleDelete = async () => {
    if (!deleteProduct) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteProduct.id);
      setDeleteProduct(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
              className={cn(
                "w-full h-10 pl-9 pr-3 rounded-md border border-input bg-card text-sm",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              )}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => onFilterCategory(e.target.value)}
          className={cn(
            "h-10 px-3 rounded-md border border-input bg-card text-sm",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing {products.length} of {total} products
      </p>

      {/* Product Table */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-lg">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                  Product
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden sm:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                  Price
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden md:table-cell">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-16 relative rounded overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {product.categories?.name || "No category"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {product.categories?.name || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {formatCurrency(product.price)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                        product.is_active
                          ? "bg-green-500/10 text-green-600"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/products/edit/${product.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteProduct(product)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteProduct}
        onClose={() => setDeleteProduct(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteProduct?.name}"? This will hide the product from the catalog.`}
      />
    </div>
  );
}
