import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ProductForm } from "@/components/admin";
import {
  getAdminProductById,
  updateProduct,
} from "@/lib/services/admin/product.admin.service";
import { getCategories } from "@/lib/services/category.service";
import { revalidatePath } from "next/cache";

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getAdminProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  async function handleSubmit(data: {
    name: string;
    description?: string;
    price: number;
    category_id?: string;
    image_url: string;
    is_active?: boolean;
  }) {
    "use server";

    const result = await updateProduct(id, data);

    if (!result.success) {
      throw new Error(result.error || "Failed to update product");
    }

    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    revalidatePath(`/catalog/${result.product?.slug}`);
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
        <h1 className="text-2xl font-bold text-foreground">Edit Product</h1>
        <p className="text-muted-foreground mt-1">
          Update product details
        </p>
      </div>

      {/* Form */}
      <ProductForm
        product={product}
        categories={categories}
        onSubmit={handleSubmit}
        submitLabel="Update Product"
      />
    </div>
  );
}
