"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/types";

// Cart item with full product details
export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string;
    categories: Category | null;
  };
}

// Simple cart item for storage
interface StoredCartItem {
  productId: string;
  quantity: number;
}

const CART_STORAGE_KEY = "virtual-tryon-cart";

// ============ Local Storage Helpers ============

function getStoredCart(): StoredCartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as StoredCartItem[];
  } catch {
    return [];
  }
}

function setStoredCart(items: StoredCartItem[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}

function clearStoredCart(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear cart from localStorage:", error);
  }
}

// ============ Cart Operations ============

/**
 * Add a product to cart. If product already exists, increment quantity.
 */
export function addToCart(productId: string, quantity: number = 1): StoredCartItem[] {
  const cart = getStoredCart();
  const existingIndex = cart.findIndex(item => item.productId === productId);

  if (existingIndex >= 0) {
    // FR-003: Increment quantity if exists
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  setStoredCart(cart);
  return cart;
}

/**
 * Update quantity of a cart item. If quantity is 0 or less, remove item.
 */
export function updateCartQuantity(productId: string, quantity: number): StoredCartItem[] {
  const cart = getStoredCart();

  // FR-010: Remove when quantity zero
  if (quantity <= 0) {
    return removeFromCart(productId);
  }

  const existingIndex = cart.findIndex(item => item.productId === productId);

  if (existingIndex >= 0) {
    cart[existingIndex].quantity = quantity;
    setStoredCart(cart);
  }

  return cart;
}

/**
 * Remove a product from cart
 */
export function removeFromCart(productId: string): StoredCartItem[] {
  const cart = getStoredCart();
  const filtered = cart.filter(item => item.productId !== productId);
  setStoredCart(filtered);
  return filtered;
}

/**
 * Clear the entire cart
 */
export function clearCart(): void {
  clearStoredCart();
}

/**
 * Get cart items with full product details from Supabase
 */
export async function getCartWithProducts(): Promise<CartItemWithProduct[]> {
  const cart = getStoredCart();

  if (cart.length === 0) return [];

  const supabase = getSupabaseClient();
  const productIds = cart.map(item => item.productId);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, slug, price, image_url, categories(*)")
    .in("id", productIds)
    .eq("is_active", true);

  if (error) {
    console.error("Failed to fetch cart products:", error);
    return [];
  }

  // Map products to cart items
  const productMap = new Map(products?.map(p => [p.id, p]) || []);
  const cartItems: CartItemWithProduct[] = [];
  const validProductIds: string[] = [];

  for (const item of cart) {
    const product = productMap.get(item.productId);
    if (product) {
      cartItems.push({
        id: item.productId,
        productId: item.productId,
        quantity: item.quantity,
        product: {
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image_url: product.image_url,
          categories: product.categories as Category | null,
        },
      });
      validProductIds.push(item.productId);
    }
  }

  // FR-016: Handle unavailable products - clean up invalid items
  if (validProductIds.length !== cart.length) {
    const validCart = cart.filter(item => validProductIds.includes(item.productId));
    setStoredCart(validCart);
  }

  return cartItems;
}

/**
 * Get stored cart (without product details) for quick access
 */
export function getStoredCartItems(): StoredCartItem[] {
  return getStoredCart();
}

/**
 * Calculate cart total
 */
export function calculateCartTotal(items: CartItemWithProduct[]): number {
  return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}

/**
 * Get total item count
 */
export function getCartItemCount(): number {
  const cart = getStoredCart();
  return cart.reduce((count, item) => count + item.quantity, 0);
}
