/**
 * @fileoverview Authentication type definitions
 * @module types/auth
 * 
 * Dependencies: Firebase Auth
 * Usage: Type definitions for user authentication and session management
 */

import type { User as FirebaseUser } from "firebase/auth";

/**
 * User profile information stored in Firestore
 */
export interface UserProfile {
  /** Unique user identifier from Firebase Auth */
  uid: string;
  /** User's email address */
  email: string;
  /** User's display name */
  displayName: string | null;
  /** User's profile photo URL */
  photoURL: string | null;
  /** Timestamp when the user was created */
  createdAt: Date;
  /** Timestamp when the user was last updated */
  updatedAt: Date;
  /** User's preferred language for suggestions */
  language: string;
  /** User's writing proficiency level */
  proficiencyLevel: "beginner" | "intermediate" | "advanced";
}

/**
 * Authentication state for the application
 */
export interface AuthState {
  /** Current authenticated user */
  user: FirebaseUser | null;
  /** User's profile information */
  profile: UserProfile | null;
  /** Whether authentication is in progress */
  loading: boolean;
  /** Authentication error message */
  error: string | null;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
}

/**
 * Sign-in form data
 */
export interface SignInFormData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Sign-up form data
 */
export interface SignUpFormData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Password confirmation */
  confirmPassword: string;
  /** User's display name */
  displayName: string;
  /** User's preferred language */
  language: string;
  /** User's writing proficiency level */
  proficiencyLevel: "beginner" | "intermediate" | "advanced";
}

/**
 * Authentication error types
 */
export type AuthError = 
  // Email/Password Authentication Errors
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/invalid-email"
  | "auth/invalid-credential"
  | "auth/user-disabled"
  | "auth/too-many-requests"
  
  // Account Creation Errors
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/operation-not-allowed"
  
  // Network and Technical Errors
  | "auth/network-request-failed"
  | "auth/timeout"
  | "auth/internal-error"
  
  // OAuth/Popup Errors
  | "auth/popup-closed-by-user"
  | "auth/popup-blocked"
  | "auth/cancelled-popup-request"
  | "auth/unauthorized-domain"
  
  // Token and Session Errors
  | "auth/invalid-api-key"
  | "auth/app-deleted"
  | "auth/expired-action-code"
  | "auth/invalid-action-code"
  
  // Rate Limiting and Quota Errors
  | "auth/quota-exceeded"
  | "auth/missing-android-pkg-name"
  | "auth/missing-ios-bundle-id"
  
  // Additional common errors
  | "auth/account-exists-with-different-credential"
  | "auth/invalid-verification-code"
  | "auth/invalid-verification-id"
  | "auth/missing-verification-code"
  | "auth/missing-verification-id"
  | "auth/code-expired"
  | "auth/credential-already-in-use"
  | "unknown";

/**
 * Authentication action types for context/state management
 */
export type AuthAction = 
  | { type: "AUTH_LOADING" }
  | { type: "AUTH_SUCCESS"; payload: { user: FirebaseUser; profile: UserProfile } }
  | { type: "AUTH_ERROR"; payload: { error: string } }
  | { type: "AUTH_LOGOUT" }
  | { type: "PROFILE_UPDATE"; payload: { profile: UserProfile } }; 
