import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "./index";

/**
 * Authentication state for the application
 */
export interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Sign up credentials
 */
export interface SignUpCredentials {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Sign in credentials
 */
export interface SignInCredentials {
  email: string;
  password: string;
}

/**
 * Password reset request
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Update password request
 */
export interface UpdatePasswordRequest {
  password: string;
}

/**
 * Authentication result
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
}

/**
 * Profile update data
 */
export interface ProfileUpdateData {
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Protected route configuration
 */
export interface ProtectedRouteConfig {
  requireAuth: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * Auth context value interface
 */
export interface AuthContextValue extends AuthState {
  signUp: (credentials: SignUpCredentials) => Promise<AuthResult>;
  signIn: (credentials: SignInCredentials) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
}
