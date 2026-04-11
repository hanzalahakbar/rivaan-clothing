"use client";

import type { CartItemWithProduct } from "./cart.service";
import { formatCurrency } from "@/lib/utils";

// WhatsApp number for the store (can be configured via env)
const STORE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "1234567890";
const STORE_URL = process.env.NEXT_PUBLIC_STORE_URL || "https://virtual-tryon.store";

export interface CheckoutData {
  name: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}

export interface OrderSummaryData {
  customer: CheckoutData;
  items: CartItemWithProduct[];
  total: number;
}

/**
 * Generate formatted order message for WhatsApp
 * FR-011: Format with customer details
 * FR-012: Include items with quantities
 * FR-013: Include total price
 * FR-014: Include store link
 */
export function generateOrderMessage(data: OrderSummaryData): string {
  const { customer, items, total } = data;

  // Header
  let message = `*New Order*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;

  // Customer Details (FR-011)
  message += `*Customer Details*\n`;
  message += `Name: ${customer.name}\n`;
  message += `Phone: ${customer.phone}\n`;
  message += `City: ${customer.city}\n`;
  message += `Address: ${customer.address}\n`;
  if (customer.notes) {
    message += `Notes: ${customer.notes}\n`;
  }
  message += `\n`;

  // Order Items (FR-012)
  message += `*Order Items*\n`;
  message += `━━━━━━━━━━━━━━━━━━\n`;
  items.forEach((item, index) => {
    const lineTotal = item.product.price * item.quantity;
    message += `${index + 1}. ${item.product.name}\n`;
    message += `   Qty: ${item.quantity} x ${formatCurrency(item.product.price)}\n`;
    message += `   Subtotal: ${formatCurrency(lineTotal)}\n`;
    if (index < items.length - 1) {
      message += `\n`;
    }
  });
  message += `━━━━━━━━━━━━━━━━━━\n`;

  // Total (FR-013)
  message += `\n*Total: ${formatCurrency(total)}*\n\n`;

  // Store Link (FR-014)
  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `Order placed via:\n${STORE_URL}`;

  return message;
}

/**
 * Generate WhatsApp URL with pre-filled message
 * FR-015: Redirect to WhatsApp
 * FR-016: Support mobile app and web redirects (wa.me works for both)
 */
export function getWhatsAppUrl(message: string, phoneNumber?: string): string {
  const phone = phoneNumber || STORE_WHATSAPP_NUMBER;
  // Remove any non-numeric characters from phone number
  const cleanPhone = phone.replace(/\D/g, "");
  // URL encode the message
  const encodedMessage = encodeURIComponent(message);
  // wa.me URL scheme works on both mobile and desktop
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

/**
 * Generate complete WhatsApp checkout URL
 */
export function generateCheckoutUrl(data: OrderSummaryData): string {
  const message = generateOrderMessage(data);
  return getWhatsAppUrl(message);
}

/**
 * Validate phone number format
 * FR-005: Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove spaces and dashes for validation
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Accept formats: +1234567890, 1234567890, or local formats (10+ digits)
  // Minimum 10 digits, maximum 15 (international standard)
  const phoneRegex = /^\+?[0-9]{10,15}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Simple format: keep the original with basic cleanup
  return phone.trim().replace(/\s+/g, " ");
}
