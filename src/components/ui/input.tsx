/**
 * @fileoverview Input component
 * @module components/ui/input
 * 
 * Dependencies: React, Tailwind CSS, class-variance-authority
 * Usage: Styled input component with variants and proper accessibility
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input component props extending native input attributes
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Input component
 * A styled input component with proper focus states and accessibility
 * 
 * @param className Additional CSS classes
 * @param type Input type (text, email, password, etc.)
 * @param props Other HTML input attributes
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input }; 
