/**
 * @fileoverview Authentication context definition
 * @module hooks/auth/authContext
 * 
 * Dependencies: React
 * Usage: Provides the AuthContext for authentication state management
 */

import { createContext } from "react";
import type { AuthState } from "@/types/auth";

/**
 * Authentication context type definition
 */
export interface AuthContextType extends AuthState {
  /** Sign out the current user */
  signOut: () => Promise<void>;
  /** Clear authentication errors */
  clearError: () => void;
  /** Refresh user profile */
  refreshProfile: () => Promise<void>;
}

/**
 * Authentication context
 */
export const AuthContext = createContext<AuthContextType | undefined>(undefined); 
