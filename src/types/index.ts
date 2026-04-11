// Database types
export type { Database, Tables, TablesInsert, TablesUpdate } from "./database";
import type { Tables } from "./database";

// Re-export commonly used table types
export type Profile = Tables<"profiles">;
export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type UserPhoto = Tables<"user_photos">;
export type GenerationJob = Tables<"generation_jobs">;
export type UserGenerationQuota = Tables<"user_generation_quotas">;
export type Cart = Tables<"carts">;
export type CartItem = Tables<"cart_items">;
