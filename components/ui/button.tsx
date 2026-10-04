import * as React from "react";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,border-color,color,opacity,transform,filter] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua focus-visible:ring-offset-2 focus-visible:ring-offset-canvas active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Neutral action on any surface. */
        default: "border border-hairline bg-white/[0.08] text-white hover:bg-white/[0.13]",
        /** The single primary call to action of a view: aurora gradient, dark ink. */
        cta: "bg-aurora text-canvas text-[13px] uppercase tracking-[0.12em] hover:brightness-[1.04] hover:saturate-150",
        destructive: "border border-danger/30 bg-danger/10 text-danger hover:bg-danger/[0.18]",
        outline: "border border-white/[0.14] bg-transparent text-mist hover:border-white/25 hover:bg-white/[0.05]",
        secondary: "border border-hairline bg-raised text-mist hover:bg-[#04423e]",
        ghost: "text-silver hover:bg-white/[0.06] hover:text-white",
        link: "h-auto px-0 text-aqua underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-10 px-3",
        lg: "h-12 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
