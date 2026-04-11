"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button, Input, GlassCard, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui";
import { AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const { resetPassword } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setError(null);
    setSuccess(false);

    const result = await resetPassword(data.email);

    if (!result.success) {
      setError(result.error || "Failed to send reset email");
    } else {
      setSuccess(true);
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {success ? (
          <div className="space-y-4">
            <div
              className="flex items-center gap-2 p-3 text-sm text-success bg-success/10 rounded-md"
              role="alert"
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
              <span>Check your email for a password reset link</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              If you don&apos;t see the email, check your spam folder.
            </p>
          </div>
        ) : (
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

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <Link
          href="/signin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary focus-ring rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </CardFooter>
    </GlassCard>
  );
}
