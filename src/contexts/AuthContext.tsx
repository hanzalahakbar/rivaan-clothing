"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import type {
  AuthContextValue,
  AuthResult,
  SignUpCredentials,
  SignInCredentials,
} from "@/types/auth";
import type { Profile } from "@/types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseClient();

  // Fetch user profile from database
  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      return data;
    },
    [supabase]
  );

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [user, fetchProfile]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session: currentSession },
        } = await supabase.auth.getSession();

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          const profileData = await fetchProfile(currentSession.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        const profileData = await fetchProfile(newSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      // Handle specific auth events
      if (event === "SIGNED_OUT") {
        setUser(null);
        setProfile(null);
        setSession(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  // Sign up new user
  const signUp = async (credentials: SignUpCredentials): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            display_name: credentials.displayName,
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Update display name in profile if provided
        if (credentials.displayName) {
          await supabase
            .from("profiles")
            .update({ display_name: credentials.displayName })
            .eq("id", data.user.id);
        }

        return { success: true, user: data.user };
      }

      return { success: false, error: "Failed to create account" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  // Sign in existing user
  const signIn = async (credentials: SignInCredentials): Promise<AuthResult> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        // Generic error message for security (don't reveal if email exists)
        return { success: false, error: "Invalid email or password" };
      }

      if (data.user) {
        return { success: true, user: data.user };
      }

      return { success: false, error: "Failed to sign in" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  // Sign out user
  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  // Request password reset
  const resetPassword = async (email: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  // Update password
  const updatePassword = async (password: string): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };

  const value: AuthContextValue = {
    user,
    profile,
    session,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
