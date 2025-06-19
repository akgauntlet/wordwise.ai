/**
 * @fileoverview Sign-in form component
 * @module components/auth/SignInForm
 * 
 * Dependencies: React, Shadcn UI, Authentication services
 * Usage: Renders sign-in form with email/password and Google OAuth options
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Chrome } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "@/services/auth/authService";
import type { SignInFormData } from "@/types/auth";

/**
 * Sign-in form component props
 */
interface SignInFormProps {
  /** Callback when user wants to switch to sign-up */
  onSwitchToSignUp: () => void;
  /** Optional callback when sign-in is successful */
  onSignInSuccess?: () => void;
}

/**
 * Sign-in form component
 * Provides email/password and Google OAuth sign-in options
 * 
 * @param onSwitchToSignUp Callback to switch to sign-up form
 * @param onSignInSuccess Optional callback when sign-in succeeds
 */
export function SignInForm({ onSwitchToSignUp, onSignInSuccess }: SignInFormProps) {
  const [formData, setFormData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form input changes
   * @param field Form field name
   * @param value New field value
   */
  const handleInputChange = (field: keyof SignInFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  /**
   * Handle email/password sign-in
   * @param e Form submission event
   */
  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmail(formData);
      onSignInSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google OAuth sign-in
   */
  const handleGoogleSignIn = async (): Promise<void> => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      onSignInSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Google sign-in failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your WordWise.ai account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("email", e.target.value)}
                className="pl-10"
                disabled={isLoading || isGoogleLoading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                className="pl-10"
                disabled={isLoading || isGoogleLoading}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || isGoogleLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In with Google...
            </>
          ) : (
            <>
              <Chrome className="mr-2 h-4 w-4" />
              Sign In with Google
            </>
          )}
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="text-primary hover:underline font-medium"
            disabled={isLoading || isGoogleLoading}
          >
            Sign up here
          </button>
        </div>
      </CardFooter>
    </Card>
  );
} 
