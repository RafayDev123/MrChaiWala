import React from "react";
import { cn } from "../../utils/cn";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-stone-200/70 bg-white/90 p-5 shadow-sm shadow-stone-200/60 backdrop-blur-sm",
        className
      )}
      {...props}
    />
  );
}
