import { createClient } from "@/lib/supabase/server";
import type { Product, Category } from "@/types";

export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductWithCategory extends Product {
  categories: Category | null;
}

export interface ProductsResult {
  products: ProductWithCategory[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

const DEFAULT_LIMIT = 12;

/**
 * Get products with optional filters and pagination
 */
export async function getProducts(
  filters: ProductFilters = {}
): Promise<ProductsResult> {
  const supabase = await createClient();
  const { categoryId, minPrice, maxPrice, search, page = 1, limit = DEFAULT_LIMIT } = filters;

  // Calculate offset
  const offset = (page - 1) * limit;

  // Build query
  let query = supabase
    .from("products")
    .select("*, categories(*)", { count: "exact" })
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  // Apply filters
  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching products:", error);
    return { products: [], total: 0, page, totalPages: 0 };
  }

  const total = count || 0;
  const totalPages = Math.ceil(total / limit);

  return {
    products: (data || []) as ProductWithCategory[],
    total,
    page,
    totalPages,
  };
}

/**
 * Get a single product by slug with category
 */
export async function getProductBySlug(
  slug: string
): Promise<ProductWithCategory | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    console.error("Error fetching product:", error);
    return null;
  }

  return data as ProductWithCategory;
}

/**
 * Get the price range of all active products
 */
export async function getPriceRange(): Promise<PriceRange> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("price")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error || !data || data.length === 0) {
    console.error("Error fetching price range:", error);
    return { min: 0, max: 1000 };
  }

  const prices = data.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  };
}
