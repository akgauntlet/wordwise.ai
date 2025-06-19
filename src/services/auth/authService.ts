/**
 * @fileoverview Authentication service for Firebase Auth operations
 * @module services/auth/authService
 * 
 * Dependencies: Firebase Auth, Authentication types
 * Usage: Handle user authentication operations (sign in, sign up, OAuth)
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  type UserCredential,
  type User as FirebaseUser
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { SignInFormData, SignUpFormData, AuthError } from "@/types/auth";
import { createUserProfile } from "./profileService";

/**
 * Firebase Auth error interface
 */
interface FirebaseError extends Error {
  code: string;
  message: string;
}

/**
 * User credential with additional user info
 */
interface ExtendedUserCredential extends UserCredential {
  additionalUserInfo?: {
    isNewUser?: boolean;
  };
}

/**
 * Get user-friendly error message from Firebase Auth error
 * @param error Firebase Auth error code
 * @returns User-friendly error message
 */
function getAuthErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/user-disabled": "This account has been disabled. Please contact support.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/popup-closed-by-user": "Sign-in was cancelled. Please try again.",
    "auth/popup-blocked": "Pop-up was blocked. Please allow pop-ups and try again.",
  };

  return errorMessages[error] || "An unexpected error occurred. Please try again.";
}

/**
 * Sign in user with email and password
 * @param formData Sign-in form data
 * @returns Promise resolving to Firebase user
 * @throws Error with user-friendly message
 */
export async function signInWithEmail(formData: SignInFormData): Promise<FirebaseUser> {
  try {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );
    
    return userCredential.user;
  } catch (error) {
    console.error("Email sign-in error:", error);
    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code as AuthError;
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Sign up user with email and password
 * @param formData Sign-up form data
 * @returns Promise resolving to Firebase user
 * @throws Error with user-friendly message
 */
export async function signUpWithEmail(formData: SignUpFormData): Promise<FirebaseUser> {
  try {
    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      throw new Error("Passwords do not match.");
    }

    // Create Firebase Auth user
    const userCredential: UserCredential = await createUserWithEmailAndPassword(
      auth,
      formData.email,
      formData.password
    );

    const user = userCredential.user;

    // Create user profile in Firestore
    await createUserProfile(user.uid, {
      email: formData.email,
      displayName: formData.displayName,
      photoURL: null,
      language: formData.language,
      proficiencyLevel: formData.proficiencyLevel,
    });

    return user;
  } catch (error) {
    console.error("Email sign-up error:", error);
    
    // If it's our custom validation error, throw it as-is
    if (error instanceof Error && error.message === "Passwords do not match.") {
      throw error;
    }
    
    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code as AuthError;
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Sign in user with Google OAuth
 * @returns Promise resolving to Firebase user
 * @throws Error with user-friendly message
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const provider = new GoogleAuthProvider();
    
    // Request additional scopes if needed
    provider.addScope('profile');
    provider.addScope('email');
    
    const userCredential = await signInWithPopup(auth, provider) as ExtendedUserCredential;
    const user = userCredential.user;

    // Check if this is a new user (first-time sign-in)
    const additionalUserInfo = userCredential.additionalUserInfo;
    
    if (additionalUserInfo?.isNewUser) {
      // Create user profile in Firestore for new Google users
      await createUserProfile(user.uid, {
        email: user.email || "",
        displayName: user.displayName || "Google User",
        photoURL: user.photoURL,
        language: "en", // Default language
        proficiencyLevel: "intermediate", // Default proficiency level
      });
    }

    return user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    const firebaseError = error as FirebaseError;
    const errorCode = firebaseError.code as AuthError;
    throw new Error(getAuthErrorMessage(errorCode));
  }
}

/**
 * Sign out the current user
 * @returns Promise that resolves when sign-out is complete
 * @throws Error with user-friendly message
 */
export async function signOut(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Sign-out error:", error);
    throw new Error("Failed to sign out. Please try again.");
  }
} 
