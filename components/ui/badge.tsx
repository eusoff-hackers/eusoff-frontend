import * as React from "react";

import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-[5px] border px-2 text-[11px] font-medium leading-none tracking-[0.02em]",
  {
    variants: {
      variant: {
        default: "border-hairline bg-ink/[0.06] text-mist",
        secondary: "border-transparent bg-recessed text-silver",
        open: "border-aqua/30 bg-aqua/10 text-aqua",
        allocated: "border-lavender/30 bg-lavender/10 text-lavender",
        warn: "border-warn/30 bg-warn/10 text-warn",
        destructive: "border-danger/30 bg-danger/10 text-danger",
        outline: "border-ink/15 text-silver",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
