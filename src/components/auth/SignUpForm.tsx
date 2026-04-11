"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input, GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const signUpSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
    displayName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export function SignUpForm() {
  const { signUpWithRedirect } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setError(null);
    setSuccess(false);

    const result = await signUpWithRedirect(
      data.email,
      data.password,
      data.displayName
    );

    if (!result.success) {
      setError(result.error || "Failed to create account");
    } else {
      setSuccess(true);
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <CardDescription>
          Enter your details to get started with virtual try-on
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div
              className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div
              className="flex items-center gap-2 p-3 text-sm text-success bg-success/10 rounded-md"
              role="alert"
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>Account created successfully! Redirecting...</span>
            </div>
          )}

          <Input
            label="Display Name (optional)"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            error={errors.displayName?.message}
            {...register("displayName")}
          />

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

          <div className="text-xs text-muted-foreground">
            Password must be at least 8 characters with uppercase, lowercase, and
            a number.
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="text-primary hover:underline focus-ring rounded"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </GlassCard>
  );
}
