/**
 * @fileoverview Utility functions for real-time text analysis
 * @module utils/realtimeAnalysisUtils
 * @author WordWise.ai Team
 * @created 2024-01-XX
 * 
 * Dependencies:
 * - Browser localStorage for caching
 * - Text processing utilities
 * 
 * Usage:
 * - Content hashing for cache keys
 * - Sentence-level change detection
 * - Client-side result caching
 * - Cache cleanup and management
 * 
 * PERFORMANCE: Optimized for frequent calls and memory efficiency
 * CACHING: Implements LRU-style cache with TTL expiration
 */

import type { 
  RealtimeAnalysisResult, 
  CachedAnalysisResult, 
  AnalysisOptions,
  ContentChangeResult 
} from '@/types/realtimeAnalysis';

/**
 * Cache configuration constants
 */
const CACHE_KEY_PREFIX = 'wordwise_rt_analysis_';
const CACHE_METADATA_KEY = 'wordwise_rt_cache_metadata';
const MAX_CACHE_ENTRIES = 50; // Maximum cached analyses to prevent memory issues

/**
 * Cache metadata for managing entries
 */
interface CacheMetadata {
  entries: Array<{
    key: string;
    hash: string;
    createdAt: number;
    expiresAt: number;
    size: number;
  }>;
  totalSize: number;
}

/**
 * Generate content hash for caching and change detection
 * 
 * @param content - Text content to hash
 * @param options - Analysis options that affect the result
 * @returns Hash string for cache key generation
 */
export function generateContentHash(content: string, options: AnalysisOptions): string {
  // Create a string that includes both content and options that affect analysis
  const hashableContent = JSON.stringify({
    content: content.trim(),
    grammar: options.includeGrammar,
    style: options.includeStyle,
    readability: options.includeReadability,
    audience: options.audienceLevel || 'intermediate',
    docType: options.documentType || 'other'
  });
  
  // Simple but effective hash function for browser compatibility
  let hash = 0;
  for (let i = 0; i < hashableContent.length; i++) {
    const char = hashableContent.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Detect sentence-level changes between two text versions
 * 
 * @param previousText - Previous version of the text
 * @param currentText - Current version of the text
 * @returns Change detection result with details
 */
export function detectSentenceChanges(
  previousText: string, 
  currentText: string
): boolean {
  // Quick check for identical content
  if (previousText === currentText) {
    return false;
  }
  
  // Split into sentences using multiple delimiters
  const previousSentences = splitIntoSentences(previousText);
  const currentSentences = splitIntoSentences(currentText);
  
  // If sentence count changed significantly, consider it a change
  const sentenceCountDiff = Math.abs(previousSentences.length - currentSentences.length);
  if (sentenceCountDiff > 0) {
    return true;
  }
  
  // Check for sentence-level changes
  const maxLength = Math.max(previousSentences.length, currentSentences.length);
  let changedSentences = 0;
  
  for (let i = 0; i < maxLength; i++) {
    const prevSentence = previousSentences[i] || '';
    const currSentence = currentSentences[i] || '';
    
    // Normalize sentences for comparison (remove extra whitespace, case)
    const normalizedPrev = normalizeSentence(prevSentence);
    const normalizedCurr = normalizeSentence(currSentence);
    
    if (normalizedPrev !== normalizedCurr) {
      changedSentences++;
    }
  }
  
  // Consider it a significant change if more than 10% of sentences changed
  const changePercentage = maxLength > 0 ? (changedSentences / maxLength) * 100 : 0;
  return changePercentage > 10;
}

/**
 * Get detailed change analysis between two text versions
 * 
 * @param previousText - Previous version of the text
 * @param currentText - Current version of the text
 * @returns Detailed change analysis result
 */
export function getDetailedChangeAnalysis(
  previousText: string, 
  currentText: string
): ContentChangeResult {
  const previousSentences = splitIntoSentences(previousText);
  const currentSentences = splitIntoSentences(currentText);
  
  let changedSentences = 0;
  const maxLength = Math.max(previousSentences.length, currentSentences.length);
  
  for (let i = 0; i < maxLength; i++) {
    const prevSentence = previousSentences[i] || '';
    const currSentence = currentSentences[i] || '';
    
    if (normalizeSentence(prevSentence) !== normalizeSentence(currSentence)) {
      changedSentences++;
    }
  }
  
  const addedSentences = Math.max(0, currentSentences.length - previousSentences.length);
  const removedSentences = Math.max(0, previousSentences.length - currentSentences.length);
  const changePercentage = maxLength > 0 ? (changedSentences / maxLength) * 100 : 0;
  
  return {
    hasChanges: changedSentences > 0,
    changedSentences,
    addedSentences,
    removedSentences,
    changePercentage
  };
}

/**
 * Retrieve cached analysis result
 * 
 * @param contentHash - Content hash for cache lookup
 * @returns Cached result or null if not found/expired
 */
export function getFromCache(contentHash: string): RealtimeAnalysisResult | null {
  try {
    const cacheKey = CACHE_KEY_PREFIX + contentHash;
    const cachedData = localStorage.getItem(cacheKey);
    
    if (!cachedData) {
      return null;
    }
    
    const cached: CachedAnalysisResult = JSON.parse(cachedData);
    
    // Check if cache entry has expired
    if (Date.now() > cached.expiresAt) {
      localStorage.removeItem(cacheKey);
      updateCacheMetadata(contentHash, 'remove');
      return null;
    }
    
    // Convert timestamp back to Date object
    const result: RealtimeAnalysisResult = {
      ...cached,
      timestamp: new Date(cached.timestamp)
    };
    
    console.log('[Cache] Hit for hash:', contentHash.substring(0, 8));
    return result;
    
  } catch (error) {
    console.error('[Cache] Error reading from cache:', error);
    return null;
  }
}

/**
 * Store analysis result in cache
 * 
 * @param contentHash - Content hash for cache key
 * @param result - Analysis result to cache
 * @param ttlHours - Time to live in hours
 */
export function setToCache(
  contentHash: string, 
  result: RealtimeAnalysisResult, 
  ttlHours: number = 24
): void {
  try {
    const now = Date.now();
    const expiresAt = now + (ttlHours * 60 * 60 * 1000);
    
    const cachedResult: CachedAnalysisResult = {
      ...result,
      cachedAt: now,
      expiresAt
    };
    
    const cacheKey = CACHE_KEY_PREFIX + contentHash;
    const serialized = JSON.stringify(cachedResult);
    
    // Check if we need to make room in cache
    manageCacheSize();
    
    localStorage.setItem(cacheKey, serialized);
    updateCacheMetadata(contentHash, 'add', serialized.length);
    
    console.log('[Cache] Stored result for hash:', contentHash.substring(0, 8));
    
  } catch (error) {
    console.error('[Cache] Error storing to cache:', error);
    // If storage fails (quota exceeded), try clearing some cache
    try {
      clearOldestCacheEntries(5);
      localStorage.setItem(CACHE_KEY_PREFIX + contentHash, JSON.stringify(result));
    } catch (retryError) {
      console.error('[Cache] Failed to store even after cleanup:', retryError);
    }
  }
}

/**
 * Clear expired cache entries and return cleanup function
 * 
 * @returns Cleanup function for periodic cache maintenance
 */
export function clearExpiredCache(): () => void {
  const cleanup = () => {
    try {
      const metadata = getCacheMetadata();
      const now = Date.now();
      let removedCount = 0;
      
      metadata.entries.forEach(entry => {
        if (now > entry.expiresAt) {
          localStorage.removeItem(CACHE_KEY_PREFIX + entry.hash);
          removedCount++;
        }
      });
      
      if (removedCount > 0) {
        rebuildCacheMetadata();
        console.log(`[Cache] Cleaned up ${removedCount} expired entries`);
      }
    } catch (error) {
      console.error('[Cache] Error during cleanup:', error);
    }
  };
  
  // Run cleanup immediately
  cleanup();
  
  // Set up periodic cleanup (every 30 minutes)
  const intervalId = setInterval(cleanup, 30 * 60 * 1000);
  
  // Return cleanup function for component unmount
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  try {
    const metadata = getCacheMetadata();
    
    metadata.entries.forEach(entry => {
      localStorage.removeItem(CACHE_KEY_PREFIX + entry.hash);
    });
    
    localStorage.removeItem(CACHE_METADATA_KEY);
    console.log('[Cache] Cleared all entries');
    
  } catch (error) {
    console.error('[Cache] Error clearing cache:', error);
  }
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): {
  entryCount: number;
  totalSizeKB: number;
  oldestEntry?: string;
  newestEntry?: string;
} {
  try {
    const metadata = getCacheMetadata();
    
    const oldestEntry = metadata.entries.reduce((oldest, entry) => 
      entry.createdAt < oldest.createdAt ? entry : oldest
    );
    
    const newestEntry = metadata.entries.reduce((newest, entry) => 
      entry.createdAt > newest.createdAt ? entry : newest
    );
    
    return {
      entryCount: metadata.entries.length,
      totalSizeKB: Math.round(metadata.totalSize / 1024),
      oldestEntry: oldestEntry ? new Date(oldestEntry.createdAt).toISOString() : undefined,
      newestEntry: newestEntry ? new Date(newestEntry.createdAt).toISOString() : undefined
    };
    
  } catch (error) {
    console.error('[Cache] Error getting stats:', error);
    return { entryCount: 0, totalSizeKB: 0 };
  }
}

/**
 * Split text into sentences using multiple delimiters
 */
function splitIntoSentences(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Split on sentence endings, keeping the delimiter
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);
  
  return sentences;
}

/**
 * Normalize sentence for comparison
 */
function normalizeSentence(sentence: string): string {
  return sentence
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get cache metadata
 */
function getCacheMetadata(): CacheMetadata {
  try {
    const metadata = localStorage.getItem(CACHE_METADATA_KEY);
    return metadata ? JSON.parse(metadata) : { entries: [], totalSize: 0 };
  } catch {
    return { entries: [], totalSize: 0 };
  }
}

/**
 * Update cache metadata
 */
function updateCacheMetadata(
  hash: string, 
  operation: 'add' | 'remove', 
  size: number = 0
): void {
  try {
    const metadata = getCacheMetadata();
    
    if (operation === 'add') {
      // Remove existing entry if it exists
      metadata.entries = metadata.entries.filter(entry => entry.hash !== hash);
      
      // Add new entry
      metadata.entries.push({
        key: CACHE_KEY_PREFIX + hash,
        hash,
        createdAt: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        size
      });
      
      metadata.totalSize += size;
      
    } else if (operation === 'remove') {
      const entryIndex = metadata.entries.findIndex(entry => entry.hash === hash);
      if (entryIndex >= 0) {
        const entry = metadata.entries[entryIndex];
        metadata.totalSize -= entry.size;
        metadata.entries.splice(entryIndex, 1);
      }
    }
    
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    
  } catch (error) {
    console.error('[Cache] Error updating metadata:', error);
  }
}

/**
 * Manage cache size by removing old entries if needed
 */
function manageCacheSize(): void {
  const metadata = getCacheMetadata();
  
  if (metadata.entries.length >= MAX_CACHE_ENTRIES) {
    clearOldestCacheEntries(Math.floor(MAX_CACHE_ENTRIES * 0.2)); // Remove 20%
  }
}

/**
 * Clear oldest cache entries
 */
function clearOldestCacheEntries(count: number): void {
  try {
    const metadata = getCacheMetadata();
    
    // Sort by creation time (oldest first)
    metadata.entries.sort((a, b) => a.createdAt - b.createdAt);
    
    // Remove oldest entries
    const toRemove = metadata.entries.slice(0, count);
    toRemove.forEach(entry => {
      localStorage.removeItem(entry.key);
    });
    
    console.log(`[Cache] Removed ${toRemove.length} oldest entries`);
    rebuildCacheMetadata();
    
  } catch (error) {
    console.error('[Cache] Error clearing oldest entries:', error);
  }
}

/**
 * Rebuild cache metadata by scanning localStorage
 */
function rebuildCacheMetadata(): void {
  try {
    const metadata: CacheMetadata = { entries: [], totalSize: 0 };
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_KEY_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const cached: CachedAnalysisResult = JSON.parse(value);
            const hash = key.replace(CACHE_KEY_PREFIX, '');
            
            metadata.entries.push({
              key,
              hash,
              createdAt: cached.cachedAt,
              expiresAt: cached.expiresAt,
              size: value.length
            });
            
            metadata.totalSize += value.length;
          } catch {
            // Remove invalid cache entry
            localStorage.removeItem(key);
          }
        }
      }
    }
    
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    
  } catch (error) {
    console.error('[Cache] Error rebuilding metadata:', error);
  }
} 
