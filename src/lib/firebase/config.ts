/**
 * @fileoverview Firebase configuration and initialization
 * @module lib/firebase/config
 * 
 * Dependencies: Firebase SDK
 * Usage: Initialize and configure Firebase services for the application
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

/**
 * Firebase configuration object from environment variables
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Validates that all required Firebase environment variables are present
 * @throws Error if any required environment variable is missing
 */
function validateFirebaseConfig(): void {
  const requiredVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN", 
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Firebase environment variables: ${missingVars.join(", ")}`
    );
  }
}

// Validate configuration before initializing
validateFirebaseConfig();

/**
 * Initialize Firebase app
 */
export const app = initializeApp(firebaseConfig);

/**
 * Firebase Authentication service
 */
export const auth = getAuth(app);

/**
 * Firestore database service
 */
export const db = getFirestore(app);

/**
 * Firebase Storage service
 */
export const storage = getStorage(app);

/**
 * Firebase Functions service
 */
export const functions = getFunctions(app);

/**
 * Firebase project configuration for reference
 */
export const config = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
} as const; 
