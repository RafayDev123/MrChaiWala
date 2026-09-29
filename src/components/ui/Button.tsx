import React from "react";
import { cn } from "../../utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-900/20 hover:from-amber-400 hover:to-orange-500 active:scale-[0.98]",
  secondary:
    "bg-white text-stone-800 border border-stone-200 shadow-sm hover:bg-stone-50 active:scale-[0.98]",
  outline:
    "bg-transparent text-amber-800 border-2 border-amber-300 hover:bg-amber-50 active:scale-[0.98]",
  ghost: "bg-transparent text-stone-600 hover:bg-stone-100 active:scale-[0.98]",
  danger:
    "bg-gradient-to-b from-rose-500 to-red-600 text-white shadow-lg shadow-red-900/20 hover:from-rose-400 hover:to-red-500 active:scale-[0.98]",
  success:
    "bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-lg shadow-green-900/20 hover:from-emerald-400 hover:to-green-500 active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-5 py-3.5 text-base rounded-2xl gap-2",
  xl: "px-6 py-4 text-lg rounded-2xl gap-3",
};

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
}
