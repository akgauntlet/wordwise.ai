/**
 * @fileoverview Rate limiting utilities for API protection
 * @module utils/rateLimiting
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - Firebase Admin SDK for Firestore operations
 * 
 * Usage:
 * - Check user rate limits before processing requests
 * - Track API usage and enforce quotas
 * - Prevent abuse and manage costs
 * - Optimized with memory caching for better performance
 */

import { getFirestore } from 'firebase-admin/firestore';
import { AIAnalysisError } from '../types/ai';

/**
 * Rate limiting configuration
 */
interface RateLimitConfig {
  /** Maximum requests per user per hour */
  maxRequestsPerHour: number;
  /** Maximum characters analyzed per user per hour */
  maxCharactersPerHour: number;
  /** Window size in milliseconds (1 hour) */
  windowMs: number;
}

/**
 * User rate limit tracking data
 */
interface UserRateLimit {
  /** User ID */
  userId: string;
  /** Current window start timestamp */
  windowStart: number;
  /** Request count in current window */
  requestCount: number;
  /** Character count in current window */
  characterCount: number;
  /** Last request timestamp */
  lastRequest: number;
}

/**
 * Memory cache for rate limiting (reduces Firestore operations)
 */
interface CachedRateLimit {
  data: UserRateLimit;
  cacheTime: number;
  isDirty: boolean; // Needs to be written back to Firestore
}

/**
 * Default rate limit configuration (100 requests, 1M characters per hour)
 */
const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxRequestsPerHour: 100,
  maxCharactersPerHour: 1000000, // 1M characters
  windowMs: 60 * 60 * 1000 // 1 hour
};

/**
 * Memory cache for rate limits (5 minute cache)
 */
const rateLimitCache = new Map<string, CachedRateLimit>();
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const BATCH_WRITE_INTERVAL_MS = 30 * 1000; // 30 seconds

/**
 * Check if user has exceeded rate limits (optimized version)
 * 
 * @param userId - User ID to check
 * @param contentLength - Length of content being analyzed
 * @param isRealtime - Whether this is a real-time analysis (lighter limits)
 * @returns Promise resolving to rate limit status
 * 
 * @throws {AIAnalysisError} When rate limit is exceeded
 */
export async function checkRateLimit(
  userId: string, 
  contentLength: number,
  isRealtime: boolean = false
): Promise<void> {
  const now = Date.now();
  
  try {
    // Check memory cache first
    let cachedRateLimit = rateLimitCache.get(userId);
    let rateLimit: UserRateLimit;
    
    if (cachedRateLimit && (now - cachedRateLimit.cacheTime) < CACHE_DURATION_MS) {
      // Use cached data
      rateLimit = cachedRateLimit.data;
    } else {
      // Load from Firestore
      const db = getFirestore();
      const rateLimitRef = db.collection('rateLimits').doc(userId);
      const doc = await rateLimitRef.get();
      
      if (!doc.exists) {
        // First request for this user
        rateLimit = {
          userId,
          windowStart: now,
          requestCount: 0,
          characterCount: 0,
          lastRequest: 0
        };
      } else {
        rateLimit = doc.data() as UserRateLimit;
      }
      
      // Cache the result
      cachedRateLimit = {
        data: rateLimit,
        cacheTime: now,
        isDirty: false
      };
      rateLimitCache.set(userId, cachedRateLimit);
    }
    
    // Check if we need to reset the window
    if (now - rateLimit.windowStart >= DEFAULT_RATE_LIMIT.windowMs) {
      rateLimit.windowStart = now;
      rateLimit.requestCount = 0;
      rateLimit.characterCount = 0;
      cachedRateLimit.isDirty = true;
    }
    
    // Apply different limits for real-time vs full analysis
    const requestLimit = isRealtime ? 
      Math.floor(DEFAULT_RATE_LIMIT.maxRequestsPerHour * 1.5) : // More lenient for real-time
      DEFAULT_RATE_LIMIT.maxRequestsPerHour;
    
    const characterLimit = isRealtime ?
      Math.floor(DEFAULT_RATE_LIMIT.maxCharactersPerHour * 0.5) : // Less characters for real-time
      DEFAULT_RATE_LIMIT.maxCharactersPerHour;
    
    // Check request count limit
    if (rateLimit.requestCount >= requestLimit) {
      const resetTime = rateLimit.windowStart + DEFAULT_RATE_LIMIT.windowMs;
      const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
      
      throw {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many analysis requests. Please try again in ${minutesUntilReset} minutes.`,
        retryAfter: Math.ceil((resetTime - now) / 1000), // seconds
        details: `Request limit: ${requestLimit} per hour`
      } as AIAnalysisError;
    }
    
    // Check character count limit
    if (rateLimit.characterCount + contentLength > characterLimit) {
      const resetTime = rateLimit.windowStart + DEFAULT_RATE_LIMIT.windowMs;
      const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
      
      throw {
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too much content analyzed. Please try again in ${minutesUntilReset} minutes.`,
        retryAfter: Math.ceil((resetTime - now) / 1000), // seconds
        details: `Character limit: ${characterLimit.toLocaleString()} per hour`
      } as AIAnalysisError;
    }
    
    // Update counters
    rateLimit.requestCount++;
    rateLimit.characterCount += contentLength;
    rateLimit.lastRequest = now;
    cachedRateLimit.isDirty = true;
    
    // For real-time requests, batch writes to reduce Firestore operations
    if (isRealtime) {
      scheduleRateLimitWrite(userId);
    } else {
      // For full analysis, write immediately
      await writeRateLimitToFirestore(userId, rateLimit);
      cachedRateLimit.isDirty = false;
    }
    
  } catch (error) {
    // If it's already an AIAnalysisError, re-throw it
    if (error && typeof error === 'object' && 'code' in error) {
      throw error;
    }
    
    console.error('Error checking rate limit:', error);
    
    // Allow the request to proceed on rate limit check failure
    // This prevents Firestore issues from blocking all analysis
    console.warn(`Rate limit check failed for user ${userId}, allowing request to proceed`);
  }
}

/**
 * Batch write rate limits to Firestore (reduces operations for real-time analysis)
 */
const pendingWrites = new Set<string>();

function scheduleRateLimitWrite(userId: string): void {
  if (pendingWrites.has(userId)) {
    return; // Already scheduled
  }
  
  pendingWrites.add(userId);
  
  setTimeout(async () => {
    try {
      const cachedRateLimit = rateLimitCache.get(userId);
      if (cachedRateLimit && cachedRateLimit.isDirty) {
        await writeRateLimitToFirestore(userId, cachedRateLimit.data);
        cachedRateLimit.isDirty = false;
      }
    } catch (error) {
      console.error(`Error writing batched rate limit for user ${userId}:`, error);
    } finally {
      pendingWrites.delete(userId);
    }
  }, BATCH_WRITE_INTERVAL_MS);
}

async function writeRateLimitToFirestore(userId: string, rateLimit: UserRateLimit): Promise<void> {
  const db = getFirestore();
  const rateLimitRef = db.collection('rateLimits').doc(userId);
  await rateLimitRef.set(rateLimit);
}

/**
 * Get current rate limit status for a user
 * 
 * @param userId - User ID to check
 * @returns Promise resolving to current usage statistics
 */
export async function getRateLimitStatus(userId: string): Promise<{
  requestsUsed: number;
  requestsRemaining: number;
  charactersUsed: number;
  charactersRemaining: number;
  windowResetTime: number;
}> {
  const now = Date.now();
  
  try {
    // Check cache first
    const cachedRateLimit = rateLimitCache.get(userId);
    let rateLimit: UserRateLimit;
    
    if (cachedRateLimit && (now - cachedRateLimit.cacheTime) < CACHE_DURATION_MS) {
      rateLimit = cachedRateLimit.data;
    } else {
      const db = getFirestore();
      const rateLimitRef = db.collection('rateLimits').doc(userId);
      const doc = await rateLimitRef.get();
      
      if (!doc.exists) {
        return {
          requestsUsed: 0,
          requestsRemaining: DEFAULT_RATE_LIMIT.maxRequestsPerHour,
          charactersUsed: 0,
          charactersRemaining: DEFAULT_RATE_LIMIT.maxCharactersPerHour,
          windowResetTime: now + DEFAULT_RATE_LIMIT.windowMs
        };
      }
      
      rateLimit = doc.data() as UserRateLimit;
    }
    
    // Check if window has expired
    if (now - rateLimit.windowStart >= DEFAULT_RATE_LIMIT.windowMs) {
      return {
        requestsUsed: 0,
        requestsRemaining: DEFAULT_RATE_LIMIT.maxRequestsPerHour,
        charactersUsed: 0,
        charactersRemaining: DEFAULT_RATE_LIMIT.maxCharactersPerHour,
        windowResetTime: now + DEFAULT_RATE_LIMIT.windowMs
      };
    }
    
    return {
      requestsUsed: rateLimit.requestCount,
      requestsRemaining: Math.max(0, DEFAULT_RATE_LIMIT.maxRequestsPerHour - rateLimit.requestCount),
      charactersUsed: rateLimit.characterCount,
      charactersRemaining: Math.max(0, DEFAULT_RATE_LIMIT.maxCharactersPerHour - rateLimit.characterCount),
      windowResetTime: rateLimit.windowStart + DEFAULT_RATE_LIMIT.windowMs
    };
    
  } catch (error) {
    console.error('Error getting rate limit status:', error);
    // Return default values if there's an error
    return {
      requestsUsed: 0,
      requestsRemaining: DEFAULT_RATE_LIMIT.maxRequestsPerHour,
      charactersUsed: 0,
      charactersRemaining: DEFAULT_RATE_LIMIT.maxCharactersPerHour,
      windowResetTime: now + DEFAULT_RATE_LIMIT.windowMs
    };
  }
}

/**
 * Clean up expired rate limit records (for maintenance)
 * Should be called periodically to prevent database bloat
 * 
 * @param olderThanHours - Remove records older than this many hours
 * @returns Promise resolving to number of records cleaned up
 */
export async function cleanupExpiredRateLimits(olderThanHours: number = 24): Promise<number> {
  const db = getFirestore();
  const cutoffTime = Date.now() - (olderThanHours * 60 * 60 * 1000);
  
  try {
    const query = db.collection('rateLimits')
      .where('lastRequest', '<', cutoffTime)
      .limit(100); // Process in batches
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return 0;
    }
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
      // Also remove from memory cache
      rateLimitCache.delete(doc.id);
    });
    
    await batch.commit();
    
    console.log(`Cleaned up ${snapshot.size} expired rate limit records`);
    return snapshot.size;
    
  } catch (error) {
    console.error('Error cleaning up rate limits:', error);
    return 0;
  }
} 
