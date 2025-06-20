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
    // Dynamic import to avoid circular dependencies
    const { getFunctionsUrl } = await import('@/lib/firebase/config');
    
    const detectedUrl = getFunctionsUrl();
    
    console.group('🔧 Firebase Functions URL Detection');
    console.log('Detected URL:', detectedUrl);
    console.log('Expected for this environment:');
    
    if (window.location.hostname === 'localhost') {
      console.log('✅ Should be: http://localhost:5001/wordwise-ai-2024-12/us-central1');
    } else if (window.location.hostname.includes('.web.app') || window.location.hostname.includes('.firebaseapp.com')) {
      console.log('✅ Should be: /api (Firebase Hosting rewrites)');
    } else {
      console.log('✅ Should be: https://us-central1-wordwise-ai-2024-12.cloudfunctions.net');
    }
    
    console.groupEnd();
  } catch (error) {
    console.error('Failed to test endpoint detection:', error);
  }
} 
