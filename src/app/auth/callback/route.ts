import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Auth callback handler for email confirmations and password resets
 * This route handles the redirect from Supabase after email verification
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to the requested page after successful auth
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Redirect to error page if code exchange fails
  return NextResponse.redirect(`${origin}/signin?error=auth_callback_error`);
}
