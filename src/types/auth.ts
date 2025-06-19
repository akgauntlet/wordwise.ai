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
  | "auth/user-not-found"
  | "auth/wrong-password"
  | "auth/email-already-in-use"
  | "auth/weak-password"
  | "auth/invalid-email"
  | "auth/user-disabled"
  | "auth/operation-not-allowed"
  | "auth/too-many-requests"
  | "auth/network-request-failed"
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
