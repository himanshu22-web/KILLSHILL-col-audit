"use client";

import * as React from "react";
import { Drawer } from "vaul";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} direction="right">
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
        <Drawer.Content
          className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-base-700 bg-base-900 outline-none sm:max-w-lg"
        >
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SheetHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between border-b border-base-700 px-5 py-4">
      <div>
        <Drawer.Title className="text-base font-semibold text-base-100">{title}</Drawer.Title>
        {subtitle ? <p className="mt-0.5 text-xs text-base-400">{subtitle}</p> : null}
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="rounded-md p-1.5 text-base-400 transition-colors hover:bg-base-800 hover:text-base-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function SheetBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("flex-1 overflow-y-auto px-5 py-4", className)}>{children}</div>;
}

export { Sheet, SheetHeader, SheetBody };
