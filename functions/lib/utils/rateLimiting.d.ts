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
/**
 * Check if user has exceeded rate limits
 *
 * @param userId - User ID to check
 * @param contentLength - Length of content being analyzed
 * @returns Promise resolving to rate limit status
 *
 * @throws {AIAnalysisError} When rate limit is exceeded
 */
export declare function checkRateLimit(userId: string, contentLength: number): Promise<void>;
/**
 * Get current rate limit status for a user
 *
 * @param userId - User ID to check
 * @returns Promise resolving to current usage statistics
 */
export declare function getRateLimitStatus(userId: string): Promise<{
    requestsUsed: number;
    requestsRemaining: number;
    charactersUsed: number;
    charactersRemaining: number;
    windowResetTime: number;
}>;
/**
 * Clean up expired rate limit records (for maintenance)
 * Should be called periodically to prevent database bloat
 *
 * @param olderThanHours - Remove records older than this many hours
 * @returns Promise resolving to number of records cleaned up
 */
export declare function cleanupExpiredRateLimits(olderThanHours?: number): Promise<number>;
//# sourceMappingURL=rateLimiting.d.ts.map