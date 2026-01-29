'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        accent:
          "border-accent/30 bg-accent/10 text-accent font-semibold [a&]:hover:bg-accent/20",
        success:
          "border-transparent bg-success/10 text-success font-semibold [a&]:hover:bg-success/20 dark:bg-success/90 dark:text-success",
        warning:
          "border-transparent bg-warning/10 text-warning-text font-semibold [a&]:hover:bg-warning/20 dark:bg-warning/90 dark:text-warning-text",
        info:
          "border-transparent bg-info/10 text-info font-semibold [a&]:hover:bg-info/20 dark:bg-info/90 dark:text-info",
        danger:
          "border-transparent bg-destructive/10 text-destructive font-semibold [a&]:hover:bg-destructive/20 dark:bg-destructive/90 dark:text-destructive-foreground",
      },
      shape: {
        rounded: "rounded-md",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      shape: "full",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
