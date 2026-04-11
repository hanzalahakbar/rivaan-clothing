import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CategoryForm } from "@/components/admin";
import { createCategory } from "@/lib/services/admin/category.admin.service";
import { revalidatePath } from "next/cache";

export default async function NewCategoryPage() {
  async function handleSubmit(data: { name: string; display_order?: number }) {
    "use server";

    const result = await createCategory(data);

    if (!result.success) {
      throw new Error(result.error || "Failed to create category");
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
        <h1 className="text-2xl font-bold text-foreground">Add New Category</h1>
        <p className="text-muted-foreground mt-1">
          Create a new category for organizing products
        </p>
      </div>

      {/* Form */}
      <CategoryForm onSubmit={handleSubmit} submitLabel="Create Category" />
    </div>
  );
}
