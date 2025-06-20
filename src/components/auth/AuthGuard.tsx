/**
 * @fileoverview AuthGuard component for protecting authenticated routes
 * @module components/auth/AuthGuard
 * 
 * Dependencies: React, Authentication context
 * Usage: Wraps components that require authentication, shows loading or auth forms as needed
 */

import { useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { SignInForm } from "./SignInForm";
import { SimpleSignUpForm } from "./SimpleSignUpForm";
import { Loader2 } from "lucide-react";

/**
 * AuthGuard component props
 */
interface AuthGuardProps {
  /** Children to render when authenticated */
  children: ReactNode;
  /** Optional fallback component when not authenticated */
  fallback?: ReactNode;
}

/**
 * AuthGuard component
 * Protects routes by requiring authentication. Shows loading state,
 * sign-in form, sign-up form, or children based on authentication status.
 * 
 * @param children Components to render when authenticated
 * @param fallback Optional custom fallback when not authenticated
 */
export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, loading, user } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication forms if not authenticated
  if (!isAuthenticated || !user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center p-4">
        {showSignUp ? (
          <SimpleSignUpForm 
            onSwitchToSignIn={() => setShowSignUp(false)}
            onSignUpSuccess={() => {
              // Authentication state will be handled by the context
            }}
          />
        ) : (
          <SignInForm 
            onSwitchToSignUp={() => setShowSignUp(true)}
            onSignInSuccess={() => {
              // Authentication state will be handled by the context
            }}
          />
        )}
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
} 
