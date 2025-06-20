/**
 * @fileoverview Smart popover positioning utilities
 * @module utils/popoverPositioning
 * 
 * Dependencies: None
 * Usage: Calculate optimal popover position to prevent screen edge overlap
 */

/**
 * Popover position configuration
 */
interface PopoverPosition {
  x: number;
  y: number;
}

/**
 * Viewport boundaries
 */
interface ViewportBounds {
  width: number;
  height: number;
}

/**
 * Calculate smart popover position that avoids screen edges
 * 
 * @param mouseX - Mouse X coordinate
 * @param mouseY - Mouse Y coordinate  
 * @param popoverWidth - Popover width in pixels
 * @param popoverHeight - Popover height in pixels (estimated)
 * @param margin - Minimum margin from screen edges (default: 16px)
 * @returns Optimized position coordinates
 */
export function calculateSmartPopoverPosition(
  mouseX: number,
  mouseY: number,
  popoverWidth: number = 320, // Default w-80 (20rem = 320px)
  popoverHeight: number = 400, // Estimated height for calculations
  margin: number = 16
): PopoverPosition {
  // Get viewport dimensions
  const viewport: ViewportBounds = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  // Calculate initial position (centered horizontally, above mouse)
  let x = mouseX;
  let y = mouseY;

  // Adjust horizontal position to prevent overflow
  const halfWidth = popoverWidth / 2;
  
  // Check if popover would overflow on the right
  if (x + halfWidth + margin > viewport.width) {
    x = viewport.width - halfWidth - margin;
  }
  
  // Check if popover would overflow on the left
  if (x - halfWidth < margin) {
    x = halfWidth + margin;
  }

  // Adjust vertical position to prevent overflow
  // Default: position above the mouse cursor
  let preferredY = mouseY - popoverHeight - margin;
  
  // Check if popover would overflow at the top
  if (preferredY < margin) {
    // Position below the mouse cursor instead
    preferredY = mouseY + margin;
    
    // Check if it would overflow at the bottom when positioned below
    if (preferredY + popoverHeight + margin > viewport.height) {
      // If it doesn't fit above or below, position at the best available spot
      const spaceAbove = mouseY - margin;
      const spaceBelow = viewport.height - mouseY - margin;
      
      if (spaceAbove > spaceBelow) {
        // More space above, position at top of available space
        preferredY = margin;
      } else {
        // More space below, position to fit within bottom space
        preferredY = Math.max(margin, viewport.height - popoverHeight - margin);
      }
    }
  }

  y = preferredY;

  return { x, y };
}

/**
 * Get transform origin based on mouse position relative to popover position
 * This helps with smooth animations by setting the correct transform origin
 * 
 * @param mouseX - Original mouse X coordinate
 * @param mouseY - Original mouse Y coordinate
 * @param popoverX - Calculated popover X position
 * @param popoverY - Calculated popover Y position
 * @param popoverWidth - Popover width
 * @param popoverHeight - Popover height
 * @returns CSS transform-origin value
 */
export function getTransformOrigin(
  mouseX: number,
  mouseY: number,
  popoverX: number,
  popoverY: number,
  popoverWidth: number,
  popoverHeight: number
): string {
  // Calculate relative position of mouse within popover bounds
  const relativeX = ((mouseX - popoverX + popoverWidth / 2) / popoverWidth) * 100;
  const relativeY = ((mouseY - popoverY) / popoverHeight) * 100;
  
  // Clamp values to reasonable bounds
  const clampedX = Math.max(10, Math.min(90, relativeX));
  const clampedY = Math.max(10, Math.min(90, relativeY));
  
  return `${clampedX}% ${clampedY}%`;
}

/**
 * Check if a position would cause the popover to overflow the viewport
 * 
 * @param x - X coordinate
 * @param y - Y coordinate
 * @param width - Popover width
 * @param height - Popover height
 * @param margin - Minimum margin from edges
 * @returns True if position would cause overflow
 */
export function wouldOverflow(
  x: number,
  y: number,
  width: number,
  height: number,
  margin: number = 16
): boolean {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  };

  return (
    x - width / 2 < margin || // Left overflow
    x + width / 2 + margin > viewport.width || // Right overflow
    y < margin || // Top overflow
    y + height + margin > viewport.height // Bottom overflow
  );
} 
