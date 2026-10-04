import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full min-w-0 rounded-md border border-white/[0.12] bg-recessed px-3 text-[15px] text-mist transition-[border-color,background-color] duration-150 placeholder:text-[#8b9998] hover:border-white/20 focus-visible:border-aqua/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aqua/25 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger/70 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
