/**
 * @fileoverview Utility function for conditional className merging
 * @module lib/utils/cn
 * 
 * Dependencies: clsx, tailwind-merge
 * Usage: Combine and merge Tailwind CSS classes with conditional logic
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names and merges Tailwind CSS classes intelligently
 * 
 * This utility function combines clsx for conditional class logic with
 * tailwind-merge to resolve conflicting Tailwind classes properly.
 * 
 * @param inputs - Class values to combine (strings, objects, arrays, etc.)
 * @returns Merged and deduplicated class string
 * 
 * @example
 * ```typescript
 * cn("px-2 py-1", "px-4") // Returns "py-1 px-4"
 * cn("text-red-500", { "text-blue-500": isBlue }) // Conditional classes
 * cn(["bg-white", "text-black"], undefined, "rounded") // Array and undefined handling
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
} 
