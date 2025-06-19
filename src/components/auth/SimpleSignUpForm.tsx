/**
 * @fileoverview Simplified sign-up form component
 * @module components/auth/SimpleSignUpForm
 * 
 * Dependencies: React, Shadcn UI, Authentication services
 * Usage: Renders simplified sign-up form with email/password and Google OAuth
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, Chrome } from "lucide-react";
import { signUpWithEmail, signInWithGoogle } from "@/services/auth/authService";

/**
 * Simplified sign-up form data
 */
interface SimpleSignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

/**
 * Sign-up form component props
 */
interface SimpleSignUpFormProps {
  /** Callback when user wants to switch to sign-in */
  onSwitchToSignIn: () => void;
  /** Optional callback when sign-up is successful */
  onSignUpSuccess?: () => void;
}

/**
 * Simplified sign-up form component
 * Provides email/password registration and Google OAuth sign-up options
 * 
 * @param onSwitchToSignIn Callback to switch to sign-in form
 * @param onSignUpSuccess Optional callback when sign-up succeeds
 */
export function SimpleSignUpForm({ onSwitchToSignIn, onSignUpSuccess }: SimpleSignUpFormProps) {
  const [formData, setFormData] = useState<SimpleSignUpFormData>({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle form input changes
   * @param field Form field name
   * @param value New field value
   */
  const handleInputChange = (field: keyof SimpleSignUpFormData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null); // Clear error when user starts typing
  };

  /**
   * Handle email/password sign-up
   * @param e Form submission event
   */
  const handleEmailSignUp = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.displayName) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create extended form data with defaults
      const extendedFormData = {
        ...formData,
        language: "en",
        proficiencyLevel: "intermediate" as const,
      };
      
      await signUpWithEmail(extendedFormData);
      onSignUpSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Sign-up failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Google OAuth sign-up
   */
  const handleGoogleSignUp = async (): Promise<void> => {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await signInWithGoogle();
      onSignUpSuccess?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Google sign-up failed. Please try again.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Create Account</CardTitle>
        <CardDescription>
          Sign up for your WordWise.ai account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleEmailSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="displayName"
                type="text"
                placeholder="Enter your full name"
                value={formData.displayName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("displayName", e.target.value)}
                className="pl-10"
                disabled={isLoading || isGoogleLoading}
                autoComplete="name"
                required
              />
            </div>
          </div>

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
                placeholder="Create a password"
                value={formData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("password", e.target.value)}
                className="pl-10"
                disabled={isLoading || isGoogleLoading}
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("confirmPassword", e.target.value)}
                className="pl-10"
                disabled={isLoading || isGoogleLoading}
                autoComplete="new-password"
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
                Creating Account...
              </>
            ) : (
              "Create Account"
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
          onClick={handleGoogleSignUp}
          disabled={isLoading || isGoogleLoading}
        >
          {isGoogleLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing Up with Google...
            </>
          ) : (
            <>
              <Chrome className="mr-2 h-4 w-4" />
              Sign Up with Google
            </>
          )}
        </Button>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground text-center">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-primary hover:underline font-medium"
            disabled={isLoading || isGoogleLoading}
          >
            Sign in here
          </button>
        </div>
      </CardFooter>
    </Card>
  );
} 
