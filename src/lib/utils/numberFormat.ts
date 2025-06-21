/**
 * @fileoverview Number formatting utilities
 * @module lib/utils/numberFormat
 * 
 * Usage: Utility functions for formatting numbers with proper separators
 */

/**
 * Format a number with comma separators for thousands
 * 
 * @param value - The number to format
 * @returns The formatted number string with commas
 * 
 * @example
 * ```tsx
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1000) // "1,000"
 * formatNumber(123) // "123"
 * formatNumber(0) // "0"
 * ```
 */
export function formatNumber(value: number): string {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return value.toLocaleString('en-US');
}

/**
 * Format a count with its unit (e.g., "words", "characters")
 * 
 * @param count - The count number
 * @param unit - The unit string (e.g., "words", "characters")
 * @param showZero - Whether to show the count when it's zero
 * @returns The formatted count string
 * 
 * @example
 * ```tsx
 * formatCount(1234, "words") // "1,234 words"
 * formatCount(1, "word") // "1 word"
 * formatCount(0, "words") // "0 words"
 * formatCount(0, "words", false) // "No words"
 * ```
 */
export function formatCount(count: number, unit: string, showZero: boolean = true): string {
  if (count === 0 && !showZero) {
    return `No ${unit}`;
  }
  
  const formattedCount = formatNumber(count);
  
  // Handle singular/plural for common units
  if (count === 1) {
    if (unit === 'words') return `${formattedCount} word`;
    if (unit === 'characters') return `${formattedCount} character`;
    if (unit === 'sentences') return `${formattedCount} sentence`;
    if (unit === 'paragraphs') return `${formattedCount} paragraph`;
  }
  
  return `${formattedCount} ${unit}`;
} 
