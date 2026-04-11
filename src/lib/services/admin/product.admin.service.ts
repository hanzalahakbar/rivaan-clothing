import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/types";

export interface AdminProductWithCategory extends Product {
  categories: Category | null;
}

export interface AdminProductsResult {
  products: AdminProductWithCategory[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AdminProductFilters {
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  category_id?: string;
  image_url: string;
  is_active?: boolean;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  category_id?: string | null;
  image_url?: string;
  is_active?: boolean;
}

const DEFAULT_LIMIT = 20;

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
 * Get all products for admin (including inactive)
 */
export async function getAdminProducts(
  filters: AdminProductFilters = {}
): Promise<AdminProductsResult> {
  const supabase = await createClient();
  const { search, categoryId, isActive, page = 1, limit = DEFAULT_LIMIT } = filters;

  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select("*, categories(*)", { count: "exact" })
    .order("created_at", { ascending: false });

  // Apply filters
  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (isActive !== undefined) {
    query = query.eq("is_active", isActive);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching admin products:", error);
    return { products: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: (data || []) as AdminProductWithCategory[],
    total,
    page,
    totalPages,
  };
}

/**
 * Get a single product by ID for admin
 */
export async function getAdminProductById(
  productId: string
): Promise<AdminProductWithCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("id", productId)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as AdminProductWithCategory;
}

/**
 * Create a new product
 */
export async function createProduct(
  data: CreateProductData
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const supabase = await createClient();

  // Generate slug from name
  const baseSlug = generateSlug(data.name);
  let slug = baseSlug;
  let counter = 1;

  // Ensure unique slug
  while (true) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: data.name,
      slug,
      description: data.description || null,
      price: data.price,
      category_id: data.category_id || null,
      image_url: data.image_url,
      is_active: data.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating product:", error);
    return { success: false, error: error.message };
  }

  return { success: true, product };
}

/**
 * Update an existing product
 */
export async function updateProduct(
  productId: string,
  data: UpdateProductData
): Promise<{ success: boolean; product?: Product; error?: string }> {
  const supabase = await createClient();

  // If name is being updated, regenerate slug
  let updateData: Record<string, unknown> = { ...data };

  if (data.name) {
    const baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const { data: existing } = await supabase
        .from("products")
        .select("id")
        .eq("slug", slug)
        .neq("id", productId)
        .single();

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    updateData.slug = slug;
  }

  // Add updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  const { data: product, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", productId)
    .select()
    .single();

  if (error) {
    console.error("Error updating product:", error);
    return { success: false, error: error.message };
  }

  return { success: true, product };
}

/**
 * Delete a product (soft delete by setting is_active to false)
 * Note: We keep the record to preserve try-on history references
 */
export async function deleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Soft delete - set is_active to false
  const { error } = await supabase
    .from("products")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Permanently delete a product (use with caution)
 */
export async function hardDeleteProduct(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Error hard deleting product:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
