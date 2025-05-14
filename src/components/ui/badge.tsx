
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Delivery Statuses based on prompt
        pendiente: "border-transparent bg-mikado-yellow text-secondary-foreground hover:bg-mikado-yellow/80",
        "en-curso": "border-transparent bg-polynesian-blue text-primary-foreground hover:bg-polynesian-blue/80",
        entregado: "border-transparent bg-custom-green text-primary-foreground hover:bg-custom-green/80", // Using custom-green for clarity
        cancelado: "border-transparent bg-custom-red text-destructive-foreground hover:bg-custom-red/80",   // Using custom-red for clarity
        reprogramado: "border-transparent bg-custom-purple text-primary-foreground hover:bg-custom-purple/80", // Using custom-purple for clarity
        // Old success/warning/info - can be kept or removed if not used
        success: "border-transparent bg-green-500 text-primary-foreground hover:bg-green-500/80", 
        warning: "border-transparent bg-yellow-500 text-primary-foreground hover:bg-yellow-500/80", 
        info: "border-transparent bg-blue-500 text-primary-foreground hover:bg-blue-500/80", 
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

    