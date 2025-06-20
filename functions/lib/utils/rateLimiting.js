"use strict";
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
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRateLimit = checkRateLimit;
exports.getRateLimitStatus = getRateLimitStatus;
exports.cleanupExpiredRateLimits = cleanupExpiredRateLimits;
const firestore_1 = require("firebase-admin/firestore");
/**
 * Default rate limit configuration (100 requests, 1M characters per hour)
 */
const DEFAULT_RATE_LIMIT = {
    maxRequestsPerHour: 100,
    maxCharactersPerHour: 1000000, // 1M characters
    windowMs: 60 * 60 * 1000 // 1 hour
};
/**
 * Check if user has exceeded rate limits
 *
 * @param userId - User ID to check
 * @param contentLength - Length of content being analyzed
 * @returns Promise resolving to rate limit status
 *
 * @throws {AIAnalysisError} When rate limit is exceeded
 */
async function checkRateLimit(userId, contentLength) {
    const db = (0, firestore_1.getFirestore)();
    const rateLimitRef = db.collection('rateLimits').doc(userId);
    try {
        const doc = await rateLimitRef.get();
        const now = Date.now();
        let rateLimit;
        if (!doc.exists) {
            // First request for this user
            rateLimit = {
                userId,
                windowStart: now,
                requestCount: 0,
                characterCount: 0,
                lastRequest: 0
            };
        }
        else {
            rateLimit = doc.data();
        }
        // Check if we need to reset the window
        if (now - rateLimit.windowStart >= DEFAULT_RATE_LIMIT.windowMs) {
            rateLimit.windowStart = now;
            rateLimit.requestCount = 0;
            rateLimit.characterCount = 0;
        }
        // Check request count limit
        if (rateLimit.requestCount >= DEFAULT_RATE_LIMIT.maxRequestsPerHour) {
            const resetTime = rateLimit.windowStart + DEFAULT_RATE_LIMIT.windowMs;
            const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
            throw {
                code: 'RATE_LIMIT_EXCEEDED',
                message: `Too many analysis requests. Please try again in ${minutesUntilReset} minutes.`,
                retryAfter: Math.ceil((resetTime - now) / 1000), // seconds
                details: `Request limit: ${DEFAULT_RATE_LIMIT.maxRequestsPerHour} per hour`
            };
        }
        // Check character count limit
        if (rateLimit.characterCount + contentLength > DEFAULT_RATE_LIMIT.maxCharactersPerHour) {
            const resetTime = rateLimit.windowStart + DEFAULT_RATE_LIMIT.windowMs;
            const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
            throw {
                code: 'RATE_LIMIT_EXCEEDED',
                message: `Character analysis limit exceeded. Please try again in ${minutesUntilReset} minutes.`,
                retryAfter: Math.ceil((resetTime - now) / 1000), // seconds
                details: `Character limit: ${DEFAULT_RATE_LIMIT.maxCharactersPerHour} per hour`
            };
        }
        // Update the rate limit data
        rateLimit.requestCount += 1;
        rateLimit.characterCount += contentLength;
        rateLimit.lastRequest = now;
        // Save updated rate limit data
        await rateLimitRef.set(rateLimit);
    }
    catch (error) {
        // If it's already an AIAnalysisError, re-throw it
        if (error && typeof error === 'object' && 'code' in error) {
            throw error;
        }
        // Log unexpected errors but don't block the request
        console.error('Error checking rate limit:', error);
        // Allow the request to proceed if rate limiting fails
    }
}
/**
 * Get current rate limit status for a user
 *
 * @param userId - User ID to check
 * @returns Promise resolving to current usage statistics
 */
async function getRateLimitStatus(userId) {
    const db = (0, firestore_1.getFirestore)();
    const rateLimitRef = db.collection('rateLimits').doc(userId);
    const now = Date.now();
    try {
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
        const rateLimit = doc.data();
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
    }
    catch (error) {
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
async function cleanupExpiredRateLimits(olderThanHours = 24) {
    const db = (0, firestore_1.getFirestore)();
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
        });
        await batch.commit();
        console.log(`Cleaned up ${snapshot.size} expired rate limit records`);
        return snapshot.size;
    }
    catch (error) {
        console.error('Error cleaning up rate limits:', error);
        return 0;
    }
}
//# sourceMappingURL=rateLimiting.js.map