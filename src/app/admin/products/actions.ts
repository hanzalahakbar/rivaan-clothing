"use server";

import { revalidatePath } from "next/cache";
import { deleteProduct as deleteProductService } from "@/lib/services/admin/product.admin.service";

export async function deleteProductAction(productId: string) {
  const result = await deleteProductService(productId);

  if (result.success) {
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
  }

  return result;
}
