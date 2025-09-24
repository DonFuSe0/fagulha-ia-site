"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "text-white shadow-[0_0_0_1px_rgba(124,58,237,.35),0_10px_30px_rgba(124,58,237,.25)]",
        secondary:
          "bg-[#151523] text-[var(--color-foreground)] shadow-[inset_0_0_0_1px_var(--color-border)] hover:shadow-[inset_0_0_0_1px_var(--color-primary)]",
        ghost: "bg-transparent text-[var(--color-foreground)] hover:opacity-90",
        outline:
          "bg-transparent text-[var(--color-foreground)] shadow-[inset_0_0_0_1px_var(--color-border)] hover:shadow-[inset_0_0_0_1px_var(--color-primary)]",
        link: "bg-transparent underline-offset-4 hover:underline text-[var(--color-primary)]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5 text-[15px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const classes = cn(buttonVariants({ variant, size }), className);
    return (
      <Comp
        ref={ref}
        className={classes}
        style={
          variant === "primary"
            ? { background: "var(--gradient-primary)" }
            : undefined
        }
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
