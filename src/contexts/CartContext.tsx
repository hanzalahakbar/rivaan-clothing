"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  addToCart as addToCartService,
  updateCartQuantity as updateCartQuantityService,
  removeFromCart as removeFromCartService,
  clearCart as clearCartService,
  getCartWithProducts,
  getCartItemCount,
  calculateCartTotal,
  type CartItemWithProduct,
} from "@/lib/services/cart.service";
import { useToast } from "@/components/ui";

interface CartContextValue {
  items: CartItemWithProduct[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  addItem: (productId: string, productName?: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string, productName?: string) => Promise<void>;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { success } = useToast();

  // Calculate total from items
  const total = calculateCartTotal(items);

  // Load cart on mount
  const refreshCart = useCallback(async () => {
    try {
      const cartItems = await getCartWithProducts();
      setItems(cartItems);
      setItemCount(getCartItemCount());
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  }, []);

  useEffect(() => {
    const initCart = async () => {
      await refreshCart();
      setIsLoading(false);
    };
    initCart();
  }, [refreshCart]);

  // Add item to cart (FR-001, FR-002, FR-003, FR-013)
  const addItem = useCallback(
    async (productId: string, productName?: string) => {
      addToCartService(productId, 1);
      setItemCount(getCartItemCount());

      // Refresh to get product details
      await refreshCart();

      // FR-013: Visual feedback
      success(productName ? `Added ${productName} to cart` : "Added to cart");
    },
    [refreshCart, success]
  );

  // Update quantity (FR-008, FR-010, FR-013)
  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      updateCartQuantityService(productId, quantity);
      setItemCount(getCartItemCount());
      await refreshCart();
    },
    [refreshCart]
  );

  // Remove item (FR-009, FR-013)
  const removeItem = useCallback(
    async (productId: string, productName?: string) => {
      removeFromCartService(productId);
      setItemCount(getCartItemCount());
      await refreshCart();

      // FR-013: Visual feedback
      success(productName ? `Removed ${productName} from cart` : "Removed from cart");
    },
    [refreshCart, success]
  );

  // Clear cart
  const clearCart = useCallback(() => {
    clearCartService();
    setItems([]);
    setItemCount(0);
  }, []);

  const value: CartContextValue = {
    items,
    itemCount,
    total,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
