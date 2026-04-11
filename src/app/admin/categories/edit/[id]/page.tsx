import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CategoryForm } from "@/components/admin";
import {
  getAdminCategoryById,
  updateCategory,
} from "@/lib/services/admin/category.admin.service";
import { revalidatePath } from "next/cache";

interface EditCategoryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({
  params,
}: EditCategoryPageProps) {
  const { id } = await params;
  const category = await getAdminCategoryById(id);

  if (!category) {
    notFound();
  }

  async function handleSubmit(data: { name: string; display_order?: number }) {
    "use server";

    const result = await updateCategory(id, data);

    if (!result.success) {
      throw new Error(result.error || "Failed to update category");
    }

    revalidatePath("/admin/categories");
    revalidatePath("/catalog");
    redirect("/admin/categories");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/categories"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Edit Category</h1>
        <p className="text-muted-foreground mt-1">Update category details</p>
      </div>

      {/* Form */}
      <CategoryForm
        category={category}
        onSubmit={handleSubmit}
        submitLabel="Update Category"
      />
    </div>
  );
}
