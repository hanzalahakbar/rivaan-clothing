"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * Custom hook for authentication operations
 * Provides convenient methods for auth actions with navigation
 */
export function useAuth() {
  const auth = useAuthContext();
  const router = useRouter();

  /**
   * Sign up and redirect to home on success (only if no email confirmation needed)
   */
  const signUpWithRedirect = useCallback(
    async (
      email: string,
      password: string,
      displayName?: string,
      redirectTo: string = "/"
    ) => {
      const result = await auth.signUp({ email, password, displayName });
      // Only redirect if signup successful AND no email confirmation needed
      if (result.success && !result.needsEmailConfirmation) {
        router.push(redirectTo);
        router.refresh();
      }
      return result;
    },
    [auth, router]
  );

  /**
   * Sign in and redirect to home on success
   */
  const signInWithRedirect = useCallback(
    async (email: string, password: string, redirectTo: string = "/") => {
      const result = await auth.signIn({ email, password });
      if (result.success) {
        router.push(redirectTo);
        router.refresh();
      }
      return result;
    },
    [auth, router]
  );

  /**
   * Sign out and redirect to home
   */
  const signOutWithRedirect = useCallback(
    async (redirectTo: string = "/") => {
      await auth.signOut();
      router.push(redirectTo);
      router.refresh();
    },
    [auth, router]
  );

  /**
   * Check if user is admin
   */
  const isAdmin = auth.profile?.is_admin === true;

  /**
   * Require authentication - redirect to sign in if not authenticated
   */
  const requireAuth = useCallback(
    (redirectTo: string = "/signin") => {
      if (!auth.isLoading && !auth.isAuthenticated) {
        router.push(redirectTo);
        return false;
      }
      return auth.isAuthenticated;
    },
    [auth.isLoading, auth.isAuthenticated, router]
  );

  /**
   * Require admin role - redirect if not admin
   */
  const requireAdmin = useCallback(
    (redirectTo: string = "/") => {
      if (!auth.isLoading) {
        if (!auth.isAuthenticated) {
          router.push("/signin");
          return false;
        }
        if (!isAdmin) {
          router.push(redirectTo);
          return false;
        }
      }
      return isAdmin;
    },
    [auth.isLoading, auth.isAuthenticated, isAdmin, router]
  );

  return {
    // State
    user: auth.user,
    profile: auth.profile,
    session: auth.session,
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    isAdmin,

    // Actions from context
    signUp: auth.signUp,
    signIn: auth.signIn,
    signOut: auth.signOut,
    resetPassword: auth.resetPassword,
    updatePassword: auth.updatePassword,
    refreshProfile: auth.refreshProfile,

    // Enhanced actions with redirect
    signUpWithRedirect,
    signInWithRedirect,
    signOutWithRedirect,

    // Guards
    requireAuth,
    requireAdmin,
  };
}
