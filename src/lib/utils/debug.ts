/**
 * @fileoverview Debug utilities for environment configuration
 * @module lib/utils/debug
 * 
 * Dependencies: None
 * Usage: Debugging environment configuration issues
 */

/**
 * Log environment information for debugging
 */
export function logEnvironmentInfo(): void {
  const info = {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    origin: window.location.origin,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      SSR: import.meta.env.SSR,
      VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      VITE_FIREBASE_FUNCTIONS_URL: import.meta.env.VITE_FIREBASE_FUNCTIONS_URL,
    }
  };
  
  console.group('🔍 Environment Debug Info');
  console.table(info);
  console.groupEnd();
}

/**
 * Test Firebase Functions endpoint detection
 * Call this function in the browser console to debug endpoint detection
 */
export async function testEndpointDetection(): Promise<void> {
  try {
    console.group('🔧 Firebase Functions URL Detection');
    // Firebase Functions URL detection completed
    
    console.groupEnd();
  } catch (error) {
    console.error('Failed to test endpoint detection:', error);
  }
} 
