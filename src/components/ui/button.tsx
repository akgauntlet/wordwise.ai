/**
 * @fileoverview Button component with variants and sizes
 * @module components/ui/button
 * 
 * Dependencies: Radix UI Slot, class-variance-authority, React
 * Usage: Reusable button component with multiple variants and sizes
 */

import React from "react";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variants";

/**
 * Button component props interface
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** 
   * Whether to render as child component slot
   * When true, the button will not render its own element but instead 
   * pass props to its child component
   */
  asChild?: boolean;
}

/**
 * Button component with multiple variants and sizes
 * 
 * @param variant - Visual style variant
 * @param size - Button size
 * @param asChild - Whether to render as child slot
 * @param className - Additional CSS classes
 * @param children - Button content
 * @param props - Additional button props
 * 
 * @example
 * ```tsx
 * <Button variant="default" size="lg">
 *   Click me
 * </Button>
 * 
 * <Button variant="outline" size="sm" disabled>
 *   Disabled button
 * </Button>
 * 
 * <Button asChild>
 *   <a href="/dashboard">Go to Dashboard</a>
 * </Button>
 * ```
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button }; 
