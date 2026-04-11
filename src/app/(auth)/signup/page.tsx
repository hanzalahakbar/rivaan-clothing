import type { Metadata } from "next";
import { SignUpForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Sign Up | Virtual Try-On",
  description: "Create an account to start using virtual try-on features",
};

export default function SignUpPage() {
  return <SignUpForm />;
}
