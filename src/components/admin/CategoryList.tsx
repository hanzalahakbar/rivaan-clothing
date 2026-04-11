"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Trash2, FolderTree, GripVertical } from "lucide-react";
import { Button } from "@/components/ui";
import { DeleteConfirmModal } from "./DeleteConfirmModal";

interface CategoryWithProductCount {
  id: string;
  name: string;
  slug: string;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
  product_count: number;
}

interface CategoryListProps {
  categories: CategoryWithProductCount[];
  onDelete: (categoryId: string) => Promise<void>;
  onReorder?: (orderedIds: string[]) => Promise<void>;
}

export function CategoryList({
  categories,
  onDelete,
}: CategoryListProps) {
  const [deleteCategory, setDeleteCategory] = useState<CategoryWithProductCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteCategory.id);
      setDeleteCategory(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-card border border-border rounded-lg">
        <FolderTree className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No categories found</p>
        <Link href="/admin/categories/new" className="mt-4 inline-block">
          <Button>Create First Category</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 px-4 py-3"></th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                Category
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground">
                Products
              </th>
              <th className="text-left px-4 py-3 text-sm font-medium text-foreground hidden sm:table-cell">
                Order
              </th>
              <th className="text-right px-4 py-3 text-sm font-medium text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                </td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">
                    {category.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    {category.product_count} product{category.product_count !== 1 ? "s" : ""}
                  </span>
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {category.display_order}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/categories/edit/${category.id}`}>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteCategory(category)}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        title="Delete Category"
        message={
          deleteCategory?.product_count && deleteCategory.product_count > 0
            ? `Are you sure you want to delete "${deleteCategory?.name}"? ${deleteCategory.product_count} product(s) will become uncategorized.`
            : `Are you sure you want to delete "${deleteCategory?.name}"?`
        }
      />
    </>
  );
}
