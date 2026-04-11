"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input, GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
import { AlertCircle } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  redirectTo?: string;
}

export function SignInForm({ redirectTo = "/" }: SignInFormProps) {
  const { signInWithRedirect } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setError(null);

    const result = await signInWithRedirect(data.email, data.password, redirectTo);

    if (!result.success) {
      setError(result.error || "Failed to sign in");
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
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
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />

          <div className="flex justify-end">
            <Link
              href="/reset-password"
              className="text-sm text-muted-foreground hover:text-primary focus-ring rounded"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline focus-ring rounded"
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </GlassCard>
  );
}
