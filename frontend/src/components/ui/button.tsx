import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold",
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Gradient primary — fuchsia → violet, shifts lighter + glows on hover */
        default: cn(
          "bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white",
          "hover:from-fuchsia-400 hover:to-violet-500",
          "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-fuchsia-500/35",
          "active:translate-y-0 active:shadow-md"
        ),
        /* Destructive */
        destructive: cn(
          "bg-gradient-to-r from-rose-500 to-red-600 text-white",
          "hover:from-rose-400 hover:to-red-500",
          "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/30"
        ),
        /* Outline — gradient border feel, fills on hover */
        outline: cn(
          "border-2 border-fuchsia-500/40 bg-transparent text-fuchsia-600 dark:text-fuchsia-400",
          "hover:border-fuchsia-500 hover:bg-fuchsia-500/10",
          "hover:-translate-y-0.5 hover:shadow-md hover:shadow-fuchsia-500/20",
          "dark:border-fuchsia-500/30 dark:hover:border-fuchsia-400"
        ),
        /* Secondary */
        secondary: cn(
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/70 hover:-translate-y-0.5 hover:shadow-sm"
        ),
        /* Ghost — subtle primary tint on hover */
        ghost: cn(
          "text-muted-foreground",
          "hover:bg-primary/10 hover:text-primary",
          "hover:shadow-none"
        ),
        /* Link */
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm:      "h-9 px-4 text-xs",
        lg:      "h-11 px-7 text-base",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
