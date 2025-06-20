/**
 * @fileoverview Authentication hook
 * @module hooks/auth/useAuth
 * 
 * Dependencies: React, Authentication context
 * Usage: Hook to access authentication state and methods
 */

import { useContext } from "react";
import { AuthContext, type AuthContextType } from "./authContext";

/**
 * Hook to use authentication context
 * @returns Authentication context value
 * @throws Error if used outside of AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 
