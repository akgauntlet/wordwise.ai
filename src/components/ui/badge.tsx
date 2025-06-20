/**
 * @fileoverview Badge UI component
 * @module components/ui/badge
 * 
 * Dependencies: React, Tailwind CSS, class-variance-authority
 * Usage: Display badges, tags, and labels with different variants
 */

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { badgeVariants } from "./badge-variants";

/**
 * Badge component props
 */
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * Badge component for displaying tags and labels
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge }; 
