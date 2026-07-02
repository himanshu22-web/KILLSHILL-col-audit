import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-mono-tabular font-medium",
  {
    variants: {
      variant: {
        neutral: "border-base-600 bg-base-800 text-base-300",
        up: "border-signal-up/40 bg-signal-up-dim text-signal-up",
        down: "border-signal-down/40 bg-signal-down-dim text-signal-down",
        amber: "border-signal-amber/40 bg-signal-amber-dim text-signal-amber",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
