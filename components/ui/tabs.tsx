"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function Tabs({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function TabsList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ComponentProps<typeof Link> & { active?: boolean };

function TabsTrigger({
  className,
  active,
  ...props
}: TabsTriggerProps) {
  return (
    <Link
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        active
          ? "bg-background text-foreground shadow"
          : "hover:text-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger };
