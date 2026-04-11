"use server";

import { revalidatePath } from "next/cache";
import { deleteCategory as deleteCategoryService } from "@/lib/services/admin/category.admin.service";

export async function deleteCategoryAction(categoryId: string) {
  const result = await deleteCategoryService(categoryId);

  if (result.success) {
    revalidatePath("/admin/categories");
    revalidatePath("/catalog");
  }

  return result;
}
