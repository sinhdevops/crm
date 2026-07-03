"use client";

import * as React from "react";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ModalShellProps = React.ComponentProps<typeof DialogContent> & {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
  headerClassName?: string;
};

export function ModalShell({
  title,
  description,
  children,
  className,
  bodyClassName,
  headerClassName,
  ...props
}: ModalShellProps) {
  return (
    <DialogContent
      className={cn(
        "flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-4xl",
        className,
      )}
      {...props}
    >
      <DialogHeader
        className={cn(
          "sticky top-0 z-10 shrink-0 border-b border-[#E8E7E2] bg-background px-4 py-4 sm:px-7 sm:py-5",
          headerClassName,
        )}
      >
        <DialogTitle style={{ fontSize: 16, fontWeight: 700 }}>
          {title}
        </DialogTitle>
        {description ? (
          <DialogDescription style={{ fontSize: 13 }}>
            {description}
          </DialogDescription>
        ) : null}
      </DialogHeader>
      <div className={cn("min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-7 sm:py-6", bodyClassName)}>
        {children}
      </div>
    </DialogContent>
  );
}
