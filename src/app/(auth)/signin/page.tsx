import type { Metadata } from "next";
import { SignInForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign In | Virtual Try-On",
  description: "Sign in to your account to continue",
};

interface SignInPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirect || "/";

  return <SignInForm redirectTo={redirectTo} />;
}
