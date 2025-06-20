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
 * Get Firebase Functions URL based on environment
 * @returns The appropriate Firebase Functions URL for the current environment
 */
export function getFunctionsUrl(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  console.log('[getFunctionsUrl] Current location:', { hostname, protocol, port });
  
  // If running on localhost (local development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const localUrl = `http://localhost:5001/${config.projectId}/us-central1`;
    console.log('[getFunctionsUrl] Using local emulator:', localUrl);
    return localUrl;
  }
  
  // Check if we're on Firebase Hosting by looking for specific domains
  const isFirebaseHosting = 
    hostname.includes('.web.app') ||
    hostname.includes('.firebaseapp.com') ||
    hostname.includes('firebase') ||
    // Also check for your specific project domain
    hostname.includes('wordwise-ai-2024-12');
  
  if (isFirebaseHosting) {
    console.log('[getFunctionsUrl] Detected Firebase Hosting, using rewrites: /api');
    return '/api'; // Uses Firebase hosting rewrites
  }
  
  // Fallback to production URL for any other domain
  const productionUrl = `https://us-central1-${config.projectId}.cloudfunctions.net`;
  console.log('[getFunctionsUrl] Using production URL:', productionUrl);
  return productionUrl;
}

/**
 * Get specific function URLs for production (Cloud Run URLs)
 * Temporary workaround until Firebase Hosting rewrites are fixed
 */
export function getParseDocumentUrl(): string {
  const hostname = window.location.hostname;
  
  // If running on localhost (local development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:5001/${config.projectId}/us-central1/parseDocument`;
  }
  
  // For production, use direct Cloud Run URL
  const isFirebaseHosting = 
    hostname.includes('.web.app') ||
    hostname.includes('.firebaseapp.com') ||
    hostname.includes('firebase') ||
    hostname.includes('wordwise-ai-2024-12');
  
  if (isFirebaseHosting) {
    return 'https://parsedocument-luaeihsctq-uc.a.run.app';
  }
  
  // Fallback to Cloud Run URL
  return 'https://parsedocument-luaeihsctq-uc.a.run.app';
}

/**
 * Get specific function URLs for production (Cloud Run URLs)
 * Temporary workaround until Firebase Hosting rewrites are fixed
 */
export function getGenerateExportUrl(): string {
  const hostname = window.location.hostname;
  
  // If running on localhost (local development)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:5001/${config.projectId}/us-central1/generateExportHttp`;
  }
  
  // For production, use direct Cloud Run URL
  const isFirebaseHosting = 
    hostname.includes('.web.app') ||
    hostname.includes('.firebaseapp.com') ||
    hostname.includes('firebase') ||
    hostname.includes('wordwise-ai-2024-12');
  
  if (isFirebaseHosting) {
    return 'https://generateexporthttp-luaeihsctq-uc.a.run.app';
  }
  
  // Fallback to Cloud Run URL
  return 'https://generateexporthttp-luaeihsctq-uc.a.run.app';
}

/**
 * Firebase project configuration for reference
 */
export const config = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
} as const; 
