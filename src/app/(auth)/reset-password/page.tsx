import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Reset Password | Virtual Try-On",
  description: "Reset your password to regain access to your account",
};

export default function ResetPasswordPage() {
  return <ResetPasswordForm />;
}
