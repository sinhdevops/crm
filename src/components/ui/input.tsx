import * as React from "react"

import { cn } from "@/lib/utils"

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  size?: number | "md" | "lg";
};

function Input({ className, type, size = "md", ...props }: InputProps) {
  const controlSize = typeof size === "number" ? "md" : size;
  const nativeSize = typeof size === "number" ? size : undefined;

  return (
    <input
      type={type}
      size={nativeSize}
      data-slot="input"
      className={cn(
        "w-full min-w-0 rounded-xl border border-[#DAD8D2] bg-[#F8F8F7] px-3 text-base shadow-none transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-[#534AB7] focus-visible:ring-0 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-0 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50",
        controlSize === "md" && "h-10 py-2",
        controlSize === "lg" && "h-11 py-2.5",
        className
      )}
      {...props}
    />
  )
}

export { Input }
