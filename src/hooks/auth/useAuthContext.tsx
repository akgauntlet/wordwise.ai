/**
 * @fileoverview Authentication provider
 * @module hooks/auth/useAuthContext
 * 
 * Dependencies: React, Firebase Auth, Authentication types
 * Usage: Provides global authentication state and methods throughout the app
 */

import { useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import type { AuthState, AuthAction } from "@/types/auth";
import { getUserProfile, createUserProfile } from "@/services/auth/profileService";
import { AuthContext, type AuthContextType } from "./authContext";

/**
 * Initial authentication state
 */
const initialAuthState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

/**
 * Authentication reducer for state management
 * @param state Current authentication state
 * @param action Authentication action to perform
 * @returns Updated authentication state
 */
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "AUTH_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        profile: action.payload.profile,
        loading: false,
        error: null,
        isAuthenticated: true,
      };

    case "AUTH_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        user: null,
        profile: null,
        isAuthenticated: false,
      };

    case "AUTH_LOGOUT":
      return {
        ...state,
        user: null,
        profile: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      };

    case "PROFILE_UPDATE":
      return {
        ...state,
        profile: action.payload.profile,
      };

    default:
      return state;
  }
}

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Retry a Firestore operation with exponential backoff
 * @param operation Function that returns a Promise
 * @param maxRetries Maximum number of retry attempts
 * @param baseDelay Base delay in milliseconds
 * @returns Promise that resolves with the operation result
 */
async function retryFirestoreOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying, with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
              await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error("Max retries exceeded");
}

/**
 * Wait for Firebase Auth token to be available
 * @param user Firebase user
 * @returns Promise that resolves when token is ready
 */
async function waitForAuthToken(user: FirebaseUser): Promise<void> {
  try {
    // Get the ID token to ensure auth is fully ready
    await user.getIdToken(true);
  } catch {
    // If token isn't ready, wait a bit and try again
    await new Promise(resolve => setTimeout(resolve, 500));
    await user.getIdToken(true);
  }
}

/**
 * Authentication provider component
 * Manages global authentication state and provides auth methods to children
 * 
 * @param children React children to wrap with auth context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      dispatch({ type: "AUTH_LOADING" });
      await auth.signOut();
      dispatch({ type: "AUTH_LOGOUT" });
    } catch (error) {
      console.error("Sign out error:", error);
      dispatch({ 
        type: "AUTH_ERROR", 
        payload: { error: "Failed to sign out. Please try again." }
      });
    }
  };

  /**
   * Clear authentication errors
   */
  const clearError = (): void => {
    if (state.error) {
      dispatch({ 
        type: "AUTH_SUCCESS", 
        payload: { user: state.user!, profile: state.profile! }
      });
    }
  };

  /**
   * Refresh user profile from Firestore
   */
  const refreshProfile = async (): Promise<void> => {
    if (!state.user) return;

    try {
      const profile = await retryFirestoreOperation(
        () => getUserProfile(state.user!.uid)
      );
      if (profile) {
        dispatch({ 
          type: "PROFILE_UPDATE", 
          payload: { profile } 
        });
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  };

  /**
   * Handle authentication state changes
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        try {
          // Wait for auth token to be properly available
          await waitForAuthToken(user);
          
          // Get user profile from Firestore with retry mechanism
          let profile = await retryFirestoreOperation(
            () => getUserProfile(user.uid)
          );
          
          if (!profile) {
            // Create a default profile for existing users
            profile = await retryFirestoreOperation(
              () => createUserProfile(user.uid, {
                email: user.email || "",
                displayName: user.displayName || user.email?.split('@')[0] || "User",
                photoURL: user.photoURL,
                language: "en",
                proficiencyLevel: "intermediate",
              })
            );
          }
          
          dispatch({ 
            type: "AUTH_SUCCESS", 
            payload: { user, profile } 
          });
          
        } catch (error) {
          console.error("Error in auth state change:", error);
          
          // Instead of failing completely, let's try to continue with minimal profile
          const minimalProfile = {
            uid: user.uid,
            email: user.email || "",
            displayName: user.displayName || user.email?.split('@')[0] || "User",
            photoURL: user.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
            language: "en",
            proficiencyLevel: "intermediate" as const,
          };
          
          dispatch({ 
            type: "AUTH_SUCCESS", 
            payload: { user, profile: minimalProfile }
          });
        }
      } else {
        dispatch({ type: "AUTH_LOGOUT" });
      }
    });

    return () => unsubscribe();
  }, []);

  const contextValue: AuthContextType = {
    ...state,
    signOut,
    clearError,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
} 
