import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/types";

export interface CategoryWithProductCount extends Category {
  product_count: number;
}

export interface CreateCategoryData {
  name: string;
  display_order?: number;
}

export interface UpdateCategoryData {
  name?: string;
  display_order?: number;
}

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get all categories with product counts for admin
 */
export async function getAdminCategories(): Promise<CategoryWithProductCount[]> {
  const supabase = await createClient();

  // Get categories
  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error fetching categories:", error);
    return [];
  }

  // Get product counts for each category
  const categoriesWithCounts = await Promise.all(
    (categories || []).map(async (category) => {
      const { count } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("category_id", category.id);

      return {
        ...category,
        product_count: count || 0,
      };
    })
  );

  return categoriesWithCounts;
}

/**
 * Get a single category by ID
 */
export async function getAdminCategoryById(
  categoryId: string
): Promise<CategoryWithProductCount | null> {
  const supabase = await createClient();

  const { data: category, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", categoryId)
    .single();

  if (error) {
    console.error("Error fetching category:", error);
    return null;
  }

  // Get product count
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId);

  return {
    ...category,
    product_count: count || 0,
  };
}

/**
 * Create a new category
 */
export async function createCategory(
  data: CreateCategoryData
): Promise<{ success: boolean; category?: Category; error?: string }> {
  const supabase = await createClient();

  // Generate slug from name
  const baseSlug = generateSlug(data.name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug
  while (true) {
    const { data: existing } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Get max display_order if not provided
  let displayOrder = data.display_order;
  if (displayOrder === undefined) {
    const { data: maxOrder } = await supabase
      .from("categories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)
      .single();

    displayOrder = (maxOrder?.display_order ?? 0) + 1;
  }

  const { data: category, error } = await supabase
    .from("categories")
    .insert({
      name: data.name,
      slug,
      display_order: displayOrder,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }

  return { success: true, category };
}

/**
 * Update an existing category
 */
export async function updateCategory(
  categoryId: string,
  data: UpdateCategoryData
): Promise<{ success: boolean; category?: Category; error?: string }> {
  const supabase = await createClient();

  // If name is being updated, regenerate slug
  const updateData: Record<string, unknown> = { ...data };

  if (data.name) {
    const baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", slug)
        .neq("id", categoryId)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    updateData.slug = slug;
  }

  // Add updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  const { data: category, error } = await supabase
    .from("categories")
    .update(updateData)
    .eq("id", categoryId)
    .select()
    .single();

  if (error) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }

  return { success: true, category };
}

/**
 * Delete a category
 * Products in this category will have their category_id set to null
 */
export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // First, update products to remove category reference
  const { error: updateError } = await supabase
    .from("products")
    .update({ category_id: null, updated_at: new Date().toISOString() })
    .eq("category_id", categoryId);

  if (updateError) {
    console.error("Error updating products:", updateError);
    return { success: false, error: "Failed to update products before deletion" };
  }

  // Delete the category
  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", categoryId);

  if (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Update each category's display_order
  const updates = orderedIds.map((id, index) =>
    supabase
      .from("categories")
      .update({ display_order: index + 1, updated_at: new Date().toISOString() })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const errors = results.filter((r) => r.error);

  if (errors.length > 0) {
    console.error("Errors reordering categories:", errors);
    return { success: false, error: "Failed to reorder some categories" };
  }

  return { success: true };
}
