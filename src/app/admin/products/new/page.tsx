import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin";
import { createProduct } from "@/lib/services/admin/product.admin.service";
import { getCategories } from "@/lib/services/category.service";
import { revalidatePath } from "next/cache";

export default async function NewProductPage() {
  const categories = await getCategories();

  async function handleSubmit(data: {
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    image_url: string;
    is_active?: boolean;
  }) {
    "use server";

    const result = await createProduct(data);

    if (!result.success) {
      throw new Error(result.error || "Failed to create product");
    }

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    redirect("/admin/products");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Add New Product</h1>
        <p className="text-muted-foreground mt-1">
          Create a new product for your catalog
        </p>
      </div>

      {/* Form */}
      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Create Product"
      />
    </div>
  );
}
