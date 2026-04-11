import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase admin client with service role key
 * WARNING: Only use this on the server-side, never expose to client
 * This client bypasses Row Level Security
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables"
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Checks if a user is an admin
 * Uses service role to bypass RLS
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return false;
    }

    return profile.is_admin === true;
  } catch {
    return false;
  }
}
