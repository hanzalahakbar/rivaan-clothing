import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { UserProfile } from "@/components/auth";

export const metadata: Metadata = {
  title: "Profile | Virtual Try-On",
  description: "View and manage your account profile",
};

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/signin?redirect=/profile");
  }

  return <UserProfile />;
}
