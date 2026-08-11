import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[6px] text-sm font-bold transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b5d43] focus-visible:ring-offset-2", {
  variants: {
    variant: {
      primary: "bg-[#0b5d43] text-white hover:bg-[#073c2c] shadow-[0_8px_24px_rgba(11,93,67,.18)]",
      accent: "bg-[#d8f06d] text-[#073c2c] hover:bg-[#c9e454]",
      outline: "border border-[#cdd7d2] bg-white text-[#10221c] hover:border-[#0b5d43] hover:text-[#0b5d43]",
      ghost: "text-[#405049] hover:bg-[#eef3f0]",
      danger: "bg-[#b73d2e] text-white hover:bg-[#932f23]",
    },
    size: { sm: "h-9 px-3", md: "h-11 px-5", lg: "h-13 px-6 text-[15px]", icon: "size-10 p-0" },
  },
  defaultVariants: { variant: "primary", size: "md" },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
