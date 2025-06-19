/**
 * @fileoverview Label component
 * @module components/ui/label
 * 
 * Dependencies: React, Radix UI, Tailwind CSS
 * Usage: Styled label component with proper accessibility
 */

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Label variant styles
 */
const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
);

/**
 * Label component
 * A styled label component with accessibility features
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;

export { Label }; 
